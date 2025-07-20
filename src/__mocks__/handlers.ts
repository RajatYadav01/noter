import { http, HttpResponse } from "msw";

const mockNotes: Note[] = [
  {
    _id: "abc123",
    userID: "xyz123",
    type: "text",
    heading: "Test Note 1",
    content: "This is test note 1 content.",
    audioRecording: null,
    audioDuration: null,
    images: null,
    imageCount: null,
    isFavourite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "abc456",
    userID: "xyz123",
    type: "text",
    heading: "Test Note 2",
    content: "This is test note 2 content.",
    audioRecording: null,
    audioDuration: null,
    images: null,
    imageCount: null,
    isFavourite: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const handlers = [
  http.post(`${import.meta.env.VITE_BACKEND_API_URL}/user/new`, () => {
    return HttpResponse.json(
      { message: "Sign up successful" },
      { status: 201 }
    );
  }),

  http.post(
    `${import.meta.env.VITE_BACKEND_API_URL}/user/authenticate`,
    async ({ request }) => {
      const { emailAddress, password } = await request.clone().json();
      const mockUserName =
        emailAddress === "testuser@example.com" && password === "Password.123"
          ? "Test User"
          : "mock-user-name";
      return HttpResponse.json(
        {
          message: "Logged in successfully",
          token: "mock-auth-token",
          user: {
            id: "mock-user-id",
            name: mockUserName,
          },
        },
        { status: 200 }
      );
    }
  ),

  http.patch(
    `${import.meta.env.VITE_BACKEND_API_URL}/user/reset-password`,
    () => {
      return HttpResponse.json(
        { message: "Password reset successful" },
        { status: 201 }
      );
    }
  ),

  http.get(`${import.meta.env.VITE_BACKEND_API_URL}/user/refresh`, () => {
    return HttpResponse.json(
      {
        token: "mock-refresh-token",
        user: {
          id: "mock-user-id",
          name: "mock-user-name",
        },
      },
      { status: 200 }
    );
  }),

  http.post(`${import.meta.env.VITE_BACKEND_API_URL}/user/logout`, () => {
    return HttpResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  }),

  http.get(
    `${import.meta.env.VITE_BACKEND_API_URL}/user/get`,
    ({ request }) => {
      const url = new URL(request.url);
      const userID = url.searchParams.get("id");

      return HttpResponse.json({
        user: {
          id: userID,
          name: "Test User",
          emailAddress: "testuser@example.com",
        },
      });
    }
  ),

  http.patch(
    `${import.meta.env.VITE_BACKEND_API_URL}/user/update`,
    async ({ request }) => {
      const body = await request.text();
      const parsedData = JSON.parse(body);

      return HttpResponse.json({
        message: "User details updated successfully",
        user: {
          ...parsedData,
        },
        status: 201,
      });
    }
  ),

  http.delete(`${import.meta.env.VITE_BACKEND_API_URL}/user/delete`, () => {
    return HttpResponse.json({
      message: "User deleted successfully",
    });
  }),

  http.post(`${import.meta.env.VITE_BACKEND_API_URL}/note/new`, () => {
    return HttpResponse.json(
      { message: "Note created successfully" },
      { status: 201 }
    );
  }),

  http.get(
    `${import.meta.env.VITE_BACKEND_API_URL}/note/get`,
    ({ request }) => {
      const url = new URL(request.url);
      const noteID = url.searchParams.get("id");

      const note = noteID === "abc123" ? mockNotes[0] : mockNotes[1];

      return HttpResponse.json({ note }, { status: 200 });
    }
  ),

  http.get(`${import.meta.env.VITE_BACKEND_API_URL}/note/get-all`, async () => {
    return HttpResponse.json({ notes: mockNotes }, { status: 200 });
  }),

  http.get(
    `${import.meta.env.VITE_BACKEND_API_URL}/note/get-audio-recording`,
    async () => {
      const blob = new Blob(["fake audio data"], { type: "audio/wav" });
      return new Response(blob, {
        headers: { "Content-Type": "audio/wav" },
        status: 200,
      });
    }
  ),

  http.patch(
    `${import.meta.env.VITE_BACKEND_API_URL}/note/update`,
    async ({ request }) => {
      const body = await request.text();
      const parsedData = JSON.parse(body);

      return HttpResponse.json(
        {
          message: "Note details updated successfully",
          note: { ...parsedData },
        },
        { status: 201 }
      );
    }
  ),

  http.patch(
    `${import.meta.env.VITE_BACKEND_API_URL}/note/upload-image`,
    () => {
      return HttpResponse.json(
        {
          message: "Image uploaded successfully",
          note: { ...mockNotes[0], images: "test-image.jpg", imageCount: 1 },
        },
        { status: 201 }
      );
    }
  ),

  http.delete(
    `${import.meta.env.VITE_BACKEND_API_URL}/note/delete-image`,
    () => {
      return HttpResponse.json(
        {
          message: "Image deleted successfully",
          note: { ...mockNotes[0], images: null, imageCount: null },
        },
        { status: 200 }
      );
    }
  ),

  http.delete(`${import.meta.env.VITE_BACKEND_API_URL}/note/delete`, () => {
    return HttpResponse.json(
      { message: "Note deleted successfully" },
      { status: 200 }
    );
  }),

  http.delete(`${import.meta.env.VITE_BACKEND_API_URL}/note/delete-all`, () => {
    return HttpResponse.json(
      { message: "All notes deleted successfully" },
      { status: 200 }
    );
  }),
];
