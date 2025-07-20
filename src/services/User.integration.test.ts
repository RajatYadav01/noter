import { describe, test, expect } from "vitest";
import { getUser, updateUser, deleteUser } from "./User";

describe("User API service", () => {
  test("fetches a user by ID", async () => {
    const user = await getUser("xyz123");
    expect(user).toEqual({
      id: "xyz123",
      name: "Test User",
      emailAddress: "testuser@example.com",
    });
  });

  test("updates a user profile", async () => {
    const updatedData = JSON.stringify({
      id: "xyz123",
      name: "Testing User",
      emailAddress: "testinguser@email.com",
    });

    const user = await updateUser(updatedData);
    expect(user).toEqual({
      id: "xyz123",
      name: "Testing User",
      emailAddress: "testinguser@email.com",
    });
  });

  test("deletes a user", async () => {
    const message = await deleteUser("xyz123");
    expect(message).toBe("User deleted successfully");
  });
});
