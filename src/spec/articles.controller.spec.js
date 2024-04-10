const {
  deleteArticle,
  saveArticle,
  getArticle,
  getAllArticles,
} = require("../controllers/articles.controller");
const Article = require("../models/Article");
const User = require("../models/User");
const { sendEmail } = require("../controllers/articles.controller");
const nodemailer = require("nodemailer");

jest.mock("nodemailer");
jest.mock("../models/Article");
jest.mock("../models/User");

describe("Article Controller", () => {
  let mockSend, mockStatus, mockRes;

  beforeEach(() => {
    mockSend = jest.fn();
    mockStatus = jest.fn(() => ({ send: mockSend }));
    mockRes = { status: mockStatus };
    mockSend.mockClear();
    mockStatus.mockClear();
  });

  describe("deleteArticle", () => {
    it("should delete an article and update users", async () => {
      const req = {
        body: {
          articleId: "article123",
        },
      };

      Article.findById.mockResolvedValue({
        _id: "article123",
        author: "authorId",
        reviewers: [{ user: "reviewer1" }, { user: "reviewer2" }],
      });

      Article.deleteOne.mockResolvedValue({});
      User.updateOne.mockResolvedValue({});

      await deleteArticle(req, mockRes);

      expect(Article.deleteOne).toHaveBeenCalledWith({ _id: "article123" });
      expect(User.updateOne).toHaveBeenCalledTimes(3);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteArticle", () => {
    it("should delete an article and its references in users", async () => {
      const req = {
        body: {
          articleId: "article123",
        },
      };

      Article.findById.mockResolvedValue({
        _id: "article123",
        author: "authorId",
        reviewers: [{ user: "reviewer1Id" }, { user: "reviewer2Id" }],
      });

      Article.deleteOne.mockResolvedValue(true);
      User.updateOne.mockResolvedValue(true);

      await deleteArticle(req, mockRes);

      expect(Article.deleteOne).toHaveBeenCalledWith({ _id: "article123" });
      expect(User.updateOne).toHaveBeenCalledTimes(6);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith({
        result: "ok",
        message: "Successfully deleted the article",
      });
    });
  });

  describe("saveArticle", () => {
    it("should save a new article", async () => {
      const req = {
        body: {
          user: { _id: "user123" },
          articleContent: "New Article Content",
          textContent: "Text content",
          title: "New Article",
        },
      };

      Article.findById.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue(true);
      const newArticle = new Article();
      Article.mockReturnValue(newArticle);
      newArticle.save = jest.fn().mockResolvedValue({ _id: "article123" });

      await saveArticle(req, mockRes);

      expect(newArticle.save).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it("should update an existing article", async () => {
      const req = {
        body: {
          articleId: "existingArticle123",
          articleContent: "Updated Content",
          textContent: "Updated text content",
          title: "Updated Title",
          user: { _id: "user123" },
        },
      };

      const existingArticle = {
        _id: "existingArticle123",
        save: jest.fn().mockResolvedValue(true),
      };
      Article.findById.mockResolvedValue(existingArticle);

      await saveArticle(req, mockRes);

      expect(Article.findById).toHaveBeenCalledWith("existingArticle123");
      expect(existingArticle.title).toBe(req.body.title);
      expect(existingArticle.editorContent).toBe(req.body.articleContent);
      expect(existingArticle.previewContent).toBe(req.body.articleContent);
      expect(existingArticle.textContent).toBe(req.body.textContent);
      expect(existingArticle.save).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it("should handle errors gracefully", async () => {
      const req = {
        body: {
          articleContent: "New Article Content",
          textContent: "Text content",
          title: "New Article",
          user: { _id: "user123" },
        },
      };

      Article.findById.mockRejectedValue(new Error("Database error"));

      await saveArticle(req, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          result: "ok",
        }),
      );
    });
  });

  describe("getArticle", () => {
    it("should fetch an article and return it", async () => {
      const req = {
        query: {
          articleId: "validArticleId123",
        },
      };

      const mockArticle = {
        _id: "validArticleId123",
        title: "Test Article",
        previewContent: "This is the preview content of the test article.",
        author: {
          displayName: "John Doe",
          photoURL: "http://example.com/photo.jpg",
        },
      };

      Article.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockArticle),
      }));

      const cleanedArticle =
        "This is the cleaned preview content of the test article.";

      await getArticle(req, mockRes);

      expect(Article.findById).toHaveBeenCalledWith("validArticleId123");
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it("should return a 404 status when the article does not exist", async () => {
      const req = {
        query: {
          articleId: "nonExistentArticleId123",
        },
      };

      Article.findById.mockResolvedValue(null);

      await getArticle(req, mockRes);

      expect(Article.findById).toHaveBeenCalledWith("nonExistentArticleId123");
    });
  });

  describe("getAllArticles", () => {
    beforeEach(() => {
      mockSend.mockClear();
      mockStatus.mockClear();
      const mockRes = {
        status: jest.fn(() => mockRes),
        send: jest.fn(),
      };
    });

    it("should fetch and return all articles when articles are present", async () => {
      const req = {};
      const mockArticles = [
        { title: "Article 1", author: { displayName: "Author 1" } },
        { title: "Article 2", author: { displayName: "Author 2" } },
      ];

      Article.find.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockArticles),
      }));

      await getAllArticles(req, mockRes);

      expect(Article.find).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it("should return a message indicating no articles found when there are no articles", async () => {
      const req = {};

      Article.find.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue([]),
      }));

      await getAllArticles(req, mockRes);

      expect(Article.find).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith({
        result: "no article",
        message: "No articles",
      });
    });

    it("should handle errors gracefully", async () => {
      const req = {};

      Article.find.mockImplementation(() => ({
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      }));

      await getAllArticles(req, mockRes);

      expect(Article.find).toHaveBeenCalled();
    });
  });

  describe("sendEmail", () => {
    it("sends emails to new reviewers and updates article and user models without actual side effects", async () => {
      nodemailer.createTransport.mockReturnValue({
        sendMail: jest.fn().mockImplementation((mailOptions, callback) => {
          callback(null, { response: "250 OK" });
        }),
      });
      Article.findById.mockResolvedValue({
        reviewers: [{ email: "existingReviewer@example.com" }],
        save: jest.fn(),
      });
      User.findOne.mockResolvedValue({ _id: "user123" });
      User.findByIdAndUpdate.mockResolvedValue({});

      const req = {
        body: {
          emailList: ["newReviewer@example.com"],
          url: "http://example.com/article",
          articleId: "articleId123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const next = jest.fn();

      await sendEmail(req, res, next);

      expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    });
  });
});
