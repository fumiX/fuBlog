import { loadIdToken } from "@client/util/storage.js";
import type { DraftResponseDto, EditPostRequestDto, NewPostRequestDto, OAuthAccount, SummaryDto } from "@fumix/fu-blog-common";

export type ApiUrl = `/api/${string}`;

async function callServer<RequestType, ResponseType>(
  url: ApiUrl,
  method: "GET" | "POST",
  payload: ApiRequestJsonPayload<RequestType> | null = null,
  authenticated = true,
  contentType = "application/json",
): Promise<ResponseType> {
  const token = authenticated ? loadIdToken() : undefined;
  const headers: HeadersInit = {};
  if (token) {
    headers["X-OAuth-Type"] = token.type;
    headers["X-OAuth-Issuer"] = token.issuer;
    headers["Authorization"] = `Bearer ${token.id_token}`;
  }
  if (!(payload instanceof ApiRequestJsonPayloadWithFiles)) {
    headers["Content-Type"] = contentType;
  }

  return fetch(url, {
    method,
    headers,
    body: payload === null || payload instanceof ApiRequestJsonPayloadWithFiles ? toFormData(payload) : JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error response: " + response.status + " " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const result: ResponseType | undefined = data as ResponseType;
      if (result === undefined) {
        throw new Error("Response has wrong type! Received " + JSON.stringify(data));
      }
      return result;
    });
}

interface ApiRequestJsonPayload<T> {
  json: NonNullable<T>;
}
class ApiRequestJsonPayloadWithFiles<T> implements ApiRequestJsonPayload<T> {
  constructor(public json: NonNullable<T>, public files: File[]) {}
}

function toFormData<T>(payload: ApiRequestJsonPayloadWithFiles<T> | null): FormData | null {
  if (payload === null) {
    return null;
  }
  const data = new FormData();
  data.append("json", JSON.stringify(payload.json));
  payload.files.forEach((file, index) => data.append(`file`, file, file.name));
  return data;
}

export class AuthEndpoints {
  static async getLoggedInUser(): Promise<OAuthAccount> {
    const token = loadIdToken();
    if (token) {
      return callServer<null, OAuthAccount>("/api/auth/loggedInUser/", "POST");
    }
    return Promise.reject();
  }
}

export class OpenAiEndpoints {
  //static async letChatGptSummarize(text: string): Promise<SummaryDto> {}
}

export class PostEndpoints {
  static async createPostWithoutFiles(json: NewPostRequestDto): Promise<DraftResponseDto> {
    return callServer<NewPostRequestDto, DraftResponseDto>("/api/posts/new", "POST", { json: json });
  }
  static async createPost(json: NewPostRequestDto, files: File[]): Promise<DraftResponseDto> {
    return callServer<NewPostRequestDto, DraftResponseDto>("/api/posts/new", "POST", new ApiRequestJsonPayloadWithFiles(json, files));
  }
  static async editPost(json: EditPostRequestDto, files: File[]): Promise<DraftResponseDto> {
    return callServer<EditPostRequestDto, DraftResponseDto>(
      `/api/posts/${json.id}`,
      "POST",
      new ApiRequestJsonPayloadWithFiles(json, files),
    );
  }
  static async deletePost(id: number): Promise<{ affected: number }> {
    return callServer<void, { affected: number }>(`/api/posts/delete/${id}`, "POST");
  }
}
