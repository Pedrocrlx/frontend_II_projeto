import { authService } from "./authService";
import type { AuthError, Session, User } from "@supabase/supabase-js";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

import { supabase } from "@/lib/supabase";

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

function createUser(overrides?: Partial<User>): User {
  return {
    id: "user-1",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: "test@example.com",
    ...overrides,
  } as User;
}

function createAuthError(message: string): AuthError {
  return {
    name: "AuthError",
    message,
  } as AuthError;
}

function createSession(overrides?: Partial<Session>): Session {
  return {
    access_token: "token-123",
    refresh_token: "refresh-token-123",
    expires_in: 3600,
    token_type: "bearer",
    user: createUser(),
    ...overrides,
  } as Session;
}

describe("authService.signUp", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return user data on successful sign up", async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { user: createUser(), session: null },
      error: null,
    });

    const result = await authService.signUp({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.data?.id).toBe("user-1");
    expect(result.data?.email).toBe("test@example.com");
    expect(result.error).toBeNull();
  });

  it("should return error when Supabase returns an error", async () => {
    const authError = createAuthError("Email already in use");
    mockAuth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: authError,
    });

    const result = await authService.signUp({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe(authError);
  });

  it("should return error when user is null after sign up", async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    const result = await authService.signUp({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("User creation failed");
  });
});

describe("authService.signIn", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return user data on successful sign in", async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: createUser(), session: createSession() },
      error: null,
    });

    const result = await authService.signIn({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.data?.id).toBe("user-1");
    expect(result.error).toBeNull();
  });

  it("should return error on invalid credentials", async () => {
    const authError = createAuthError("Invalid credentials");
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: authError,
    });

    const result = await authService.signIn({
      email: "test@example.com",
      password: "wrong",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe(authError);
  });
});

describe("authService.signOut", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return no error on successful sign out", async () => {
    mockAuth.signOut.mockResolvedValue({ error: null });

    const result = await authService.signOut();

    expect(result.error).toBeNull();
  });

  it("should return error if sign out fails", async () => {
    const authError = createAuthError("Sign out failed");
    mockAuth.signOut.mockResolvedValue({ error: authError });

    const result = await authService.signOut();

    expect(result.error).toBe(authError);
  });
});

describe("authService.resetPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return no error on successful password reset request", async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    const result = await authService.resetPassword("test@example.com");

    expect(result.error).toBeNull();
    expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.objectContaining({ redirectTo: expect.any(String) })
    );
  });

  it("should return error if reset request fails", async () => {
    const authError = createAuthError("User not found");
    mockAuth.resetPasswordForEmail.mockResolvedValue({ data: null, error: authError });

    const result = await authService.resetPassword("unknown@example.com");

    expect(result.error).toBe(authError);
  });
});

describe("authService.getSession", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return session when authenticated", async () => {
    const mockSession = createSession({ user: createUser({ id: "user-1" }) });
    mockAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const session = await authService.getSession();

    expect(session).toBe(mockSession);
  });

  it("should return null when no session exists", async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const session = await authService.getSession();

    expect(session).toBeNull();
  });
});
