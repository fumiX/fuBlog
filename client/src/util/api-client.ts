import { loadIdToken, updateIdToken } from "@client/util/storage.js";
import type {
  AiSummaryData,
  DataUrl,
  DraftResponseDto,
  EditPostRequestDto,
  JsonMimeType,
  LoggedInUserInfo,
  NewPostRequestDto,
  PublicPost,
  SupportedImageMimeType,
} from "@fumix/fu-blog-common";
import { HttpHeader, imageBytesToDataUrl } from "@fumix/fu-blog-common";

export type ApiUrl = `/api/${string}`;

async function callServer<
  RequestType,
  ResponseMimeType extends SupportedImageMimeType | JsonMimeType,
  ResponseType = ResponseMimeType extends JsonMimeType ? any : ResponseMimeType extends SupportedImageMimeType ? ArrayBuffer : any,
>(
  url: ApiUrl,
  method: "GET" | "POST",
  responseType: ResponseMimeType,
  payload: ApiRequestJsonPayload<RequestType> | null = null,
  authenticated = true,
  contentType = "application/json",
): Promise<ResponseType> {
  const token = authenticated ? loadIdToken() : undefined;
  const headers: HeadersInit = { Accept: responseType };
  if (token) {
    headers[HttpHeader.Request.OAUTH_TYPE] = token.type;
    headers[HttpHeader.Request.OAUTH_ISSUER] = token.issuer;
    headers[HttpHeader.Request.AUTHORIZATION] = `Bearer ${token.id_token}`;
  }
  if (!(payload instanceof ApiRequestJsonPayloadWithFiles)) {
    headers["Content-Type"] = contentType;
  }

  return fetch(url, {
    method,
    headers,
    body: payload === null || payload instanceof ApiRequestJsonPayloadWithFiles ? toFormData(payload) : JSON.stringify(payload),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Error response: " + response.status + " " + response.statusText);
    }
    const refreshedIdToken = response.headers.get(HttpHeader.Response.OAUTH_REFRESHED_ID_TOKEN);
    if (refreshedIdToken) {
      updateIdToken(refreshedIdToken);
    }
    if (responseType === "application/json") {
      return response
        .json()
        .then((it) => it as ResponseType)
        .then((data) => {
          if (data === undefined) {
            throw new Error("Response has wrong type! Received " + JSON.stringify(data));
          } else {
            return data;
          }
        });
    } else {
      return response.arrayBuffer().then((it) => it as ResponseType);
    }
  });
}

interface ApiRequestJsonPayload<T> {
  json: NonNullable<T>;
}
class ApiRequestJsonPayloadWithFiles<T> implements ApiRequestJsonPayload<T> {
  constructor(
    public json: NonNullable<T>,
    public files: File[],
  ) {}
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
  static async getLoggedInUser(): Promise<LoggedInUserInfo> {
    const token = loadIdToken();
    if (token) {
      return callServer<null, JsonMimeType, LoggedInUserInfo>("/api/utility/loggedInUser", "POST", "application/json");
    }
    return Promise.reject();
  }
}

export class OpenAiEndpoints {
  static async letChatGptSummarize(text: string): Promise<AiSummaryData> {
    return callServer<string, JsonMimeType, AiSummaryData>("/api/utility/chatGptSummarize", "POST", "application/json", { json: text });
  }
  static async dallEGenerateImage(prompt: string): Promise<DataUrl> {
    return callServer<string, SupportedImageMimeType, string>("/api/utility/dallEGenerateImage", "POST", "image/png", {
      json: prompt,
    })
      .then((it) => {
        return imageBytesToDataUrl(new Uint8Array(it as unknown as ArrayBufferLike));
      })
      .then((it) => {
        if (it) {
          return it;
        }
        throw new Error();
      });
  }
}

export class PostEndpoints {
  static async createPostWithoutFiles(json: NewPostRequestDto): Promise<DraftResponseDto> {
    return callServer<NewPostRequestDto, JsonMimeType, DraftResponseDto>("/api/posts/new", "POST", "application/json", { json: json });
  }
  static async createPost(json: NewPostRequestDto, files: File[]): Promise<DraftResponseDto> {
    return callServer<NewPostRequestDto, JsonMimeType, DraftResponseDto>(
      "/api/posts/new",
      "POST",
      "application/json",
      new ApiRequestJsonPayloadWithFiles(json, files),
    );
  }
  static async editPost(json: EditPostRequestDto, files: File[]): Promise<DraftResponseDto> {
    return callServer<EditPostRequestDto, JsonMimeType, DraftResponseDto>(
      `/api/posts/${json.id}`,
      "POST",
      "application/json",
      new ApiRequestJsonPayloadWithFiles(json, files),
    );
  }
  static async deletePost(id: number): Promise<{ affected: number }> {
    return callServer<void, JsonMimeType, { affected: number }>(`/api/posts/delete/${id}`, "POST", "application/json");
  }

  static async findPosts(pageIndex: number, itemsPerPage = 12, search: string | undefined = undefined, operator: "and" | "or" = "and") {
    return callServer<void, JsonMimeType, { data: [PublicPost[], number | null] }>(
      `/api/posts/page/${pageIndex}/count/${itemsPerPage}${search ? `/search/${encodeURIComponent(search)}/operator/${operator}` : ""}`,
      "GET",
      "application/json",
      null,
      true,
    );
  }
}
