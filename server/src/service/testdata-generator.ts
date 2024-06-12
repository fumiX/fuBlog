import { Sex } from "@faker-js/faker";
import { faker } from "@faker-js/faker/locale/de";
import { DataUrl, imageBytesToDataUrl, isNeitherNullNorUndefined, OAuthAccount } from "@fumix/fu-blog-common";
import console from "console";
import { AppDataSource } from "../data-source.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { FileEntity } from "../entity/File.entity.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";
import { PostEntity } from "../entity/Post.entity.js";
import { TagEntity } from "../entity/Tag.entity.js";
import { UserEntity } from "../entity/User.entity.js";
import logger from "../logger.js";
import { MarkdownConverterServer } from "../markdown-converter-server.js";
import { AppSettings, OAuthSettings } from "../settings.js";
import { generateProfilePicture, generateRandomPng } from "./testdata/images.js";

const usersCount = 10;
const postsPerUser = 15;
const attachmentsPerPost = 2;

faker.seed(42);

export async function initDatabase(): Promise<void> {
  if (AppSettings.IS_PRODUCTION) {
    logger.info("No test data is generated in production.");
  } else {
    const usersInDbAtStart = await AppDataSource.manager.getRepository(UserEntity).count();
    if (usersInDbAtStart !== 0) {
      logger.info("Test data is already generated.");
    } else {
      logger.info("No test data in DB. Generating ⏳ …");
      await generate();
    }
  }
  logger.info("Database initialized");
}

/**
 * Generate some test data for the blog.
 */
async function generate(): Promise<void> {
  logger.info(`Generating test data (${usersCount} users, ${postsPerUser} posts per user, ${attachmentsPerPost} attachments per post)`);
  faker.seed(42);

  await Array.from({ length: 42 }).forEach(() => createRandomTag());

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
  const domain = OAuthSettings.findByType("FAKE").find(() => true)?.domain;
  if (!domain) {
    throw new Error("No domain for fake OAuth found!");
  }
  const account: OAuthAccountEntity = {
    oauthId: faker.string.alphanumeric(15),
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
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName();
    const fullName = [firstName, faker.helpers.maybe(() => faker.person.middleName(), { probability: 0.7 }), lastName]
      .filter(isNeitherNullNorUndefined)
      .join(" ");
    console.debug(`Generating 🧑 ${fullName}`);
    const profilePictureUrl: DataUrl | undefined = imageBytesToDataUrl(
      await (
        await faker.helpers.maybe(() => generateProfilePicture(faker.datatype.number(), sex), {
          probability: 0.8,
        })
      )
        ?.arrayBuffer()
        ?.then((ab) => new Uint8Array(ab)),
    );
    const user: UserEntity = {
      username: faker.internet.userName({ firstName, lastName }),
      email: faker.internet.email({ firstName, lastName }),
      fullName,
      roles: faker.helpers.arrayElement([["ADMIN"], ["WRITER"], ["EDITOR", "WRITER"], ["EDITOR"], []]),
      profilePictureUrl,
      isActive: true,
    };
    return AppDataSource.manager.getRepository(UserEntity).save(user);
  } catch (e) {
    logger.error("Error creating user", e);
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
    const sanitized = await MarkdownConverterServer.Instance.convert(dirty);
    const title = faker.lorem.sentence(4);
    console.debug(`Generating 🖺 ${title} (by ${createdBy.fullName})`);
    const tags: TagEntity[] = await AppDataSource.manager.createQueryBuilder(TagEntity, "t").select().orderBy("RANDOM()").take(5).getMany();
    const post: PostEntity = {
      title,
      description: faker.lorem.sentences(8),
      markdown: dirty,
      createdBy: createdBy,
      createdAt: faker.date.recent(),
      sanitizedHtml: sanitized,
      draft: false,
      attachments: [],
      tags: tags,
    };
    const postRep = AppDataSource.manager.getRepository(PostEntity);
    return await postRep.save(post);
  } catch (e) {
    logger.error("Error generating post", e);
  }
  return new Promise(() => null);
}

export async function createRandomAttachment(post: PostEntity, seed?: number): Promise<AttachmentEntity> {
  faker.seed(seed);
  try {
    const data = await generateRandomPng(faker.datatype.number());
    const file: FileEntity = await FileEntity.fromData(await data.arrayBuffer());
    await AppDataSource.manager.createQueryBuilder().insert().into(FileEntity).values(file).onConflict('("sha256") DO NOTHING').execute();
    const attachment: AttachmentEntity = { post, file, filename: faker.lorem.word() + ".png" };
    await AppDataSource.manager.getRepository(AttachmentEntity).insert(attachment);
    return attachment;
  } catch (e) {
    logger.error("Error generating attachment", e);
  }
  return new Promise(() => null);
}

export async function createRandomTag(seed?: number) {
  faker.seed(seed);
  const tag: TagEntity = {
    name: faker.word.noun(),
  };
  const tagRep = AppDataSource.manager.getRepository(TagEntity);
  return await tagRep.save(tag).catch((err) => logger.debug("duplicate tag? ignoring", err));
}
