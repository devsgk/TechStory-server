const {
  deleteArticle,
  saveArticle,
  getArticle,
} = require("../controllers/articles.controller");
const Article = require("../models/Article");
const User = require("../models/User");
jest.mock("../models/Article");
jest.mock("../models/User");

const mockSend = jest.fn();
const mockStatus = jest.fn(() => ({ send: mockSend }));
const mockRes = { status: mockStatus };

describe("Article Controller", () => {
  beforeEach(() => {
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
});
