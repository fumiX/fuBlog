import { Sex } from "@faker-js/faker";
import { faker } from "@faker-js/faker/locale/de";
import { OAuthAccount, sanitizeHtml } from "@fumix/fu-blog-common";
import console from "console";
import { AppDataSource } from "../data-source.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";
import { PostEntity } from "../entity/Post.entity.js";
import { UserEntity } from "../entity/User.entity.js";
import { createDomPurify } from "../markdown-converter-server.js";
import { AppSettings, OAuthSettings } from "../settings.js";
import { generateProfilePicture, generateRandomPng } from "./testdata/images.js";

const usersCount = 10;
const postsPerUser = 15;
const attachmentsPerPost = 2;

faker.seed(42);

export async function initDatabase(): Promise<void> {
  if (AppSettings.IS_PRODUCTION) {
    console.log("No test data is generated in production.");
  } else {
    const usersInDbAtStart = await AppDataSource.manager.getRepository(UserEntity).count();
    if (usersInDbAtStart !== 0) {
      console.log("Test data is already generated.");
    } else {
      await generate();
    }
  }
  console.log("Database initialized");
}

/**
 * Generate some test data for the blog.
 */
async function generate(): Promise<void> {
  console.log(`Generating test data (${usersCount} users, ${postsPerUser} posts per user, ${attachmentsPerPost} attachments per post)`);
  faker.seed(42);

  await Promise.all(
    Array.from({ length: usersCount }).map(() =>
      createRandomUser(faker.datatype.number()).then((user: UserEntity) => {
        createRandomFakeOauthAccount(user, faker.datatype.number());
        Array.from({ length: postsPerUser }).forEach(() => {
          createRandomPost(user, faker.datatype.number()).then((post: PostEntity) => {
            Array.from({ length: attachmentsPerPost }).forEach(() => {
              createRandomAttachment(post, faker.datatype.number());
            });
          });
        });
      }),
    ),
  );
}

export async function createRandomFakeOauthAccount(user: UserEntity, seed?: number): Promise<OAuthAccount> {
  faker.seed(seed);
  const domain = OAuthSettings.findByType("FAKE").find((it) => true)?.domain;
  if (!domain) {
    throw new Error("No domain for fake OAuth found!");
  }
  const account: OAuthAccountEntity = {
    oauthId: faker.random.alphaNumeric(15),
    type: "FAKE",
    user,
    domain,
  };
  return AppDataSource.manager.getRepository(OAuthAccountEntity).save(account);
}

/**
 * Creates a user.
 */
export async function createRandomUser(seed?: number): Promise<UserEntity> {
  faker.seed(seed);
  try {
    const sex = faker.helpers.arrayElement([Sex.Male, Sex.Female]);
    const firstName = faker.name.firstName(sex);
    const lastName = faker.name.lastName();
    console.debug(`Generating 🧑 ${firstName} ${lastName}`);
    const profilePicture: Uint8Array | undefined = await (
      await faker.helpers.maybe(() => generateProfilePicture(faker.datatype.number(), sex), {
        probability: 0.8,
      })
    )
      ?.arrayBuffer()
      ?.then((ab) => new Uint8Array(ab));
    const user: UserEntity = {
      username: faker.internet.userName(firstName, lastName),
      email: faker.internet.email(firstName, lastName),
      firstName: firstName,
      lastName: lastName,
      roles: faker.helpers.arrayElement([["ADMIN", "POST_CREATE"], ["POST_CREATE"], ["POST_CREATE", "POST_EDIT"], []]),
      profilePicture,
      isActive: true,
    };
    return AppDataSource.manager.getRepository(UserEntity).save(user);
  } catch (e) {
    console.log("Error creating user", e);
  }
  return new Promise(() => null);
}

/**
 * Creates a post.
 * @param createdBy the User who created the post.
 */
export async function createRandomPost(createdBy: UserEntity, seed?: number): Promise<PostEntity> {
  faker.seed(seed);
  try {
    const dirty = faker.lorem.sentences(29);
    const sanitized = sanitizeHtml(dirty, createDomPurify());
    const title = faker.lorem.sentence(4);
    console.debug(`Generating 🖺 ${title} (by ${createdBy.firstName})`);
    const post: PostEntity = {
      title,
      description: faker.lorem.sentences(8),
      markdown: dirty,
      createdBy: createdBy,
      createdAt: faker.date.recent(),
      sanitizedHtml: sanitized,
      draft: false,
      attachments: [],
    };
    const postRep = AppDataSource.manager.getRepository(PostEntity);
    return await postRep.save(post);
  } catch (e) {
    console.log("Error generating post", e);
  }
  return new Promise(() => null);
}

export async function createRandomAttachment(post: PostEntity, seed?: number): Promise<AttachmentEntity> {
  faker.seed(seed);
  try {
    const data = await generateRandomPng(faker.datatype.number());
    const attachment: AttachmentEntity = {
      post: post,
      binaryData: Buffer.from(await data.arrayBuffer()),
      filename: faker.random.word() + ".png",
      mimeType: "image/png",
    };
    const attRep = AppDataSource.manager.getRepository(AttachmentEntity);
    return await attRep.save(attachment);
  } catch (e) {
    console.log("Error generating attachment", e);
  }
  return new Promise(() => null);
}
