import { AppDataSource } from "../data-source";
import { sanitizeHtml } from "../markdown-converter-server";
import { faker } from "@faker-js/faker/locale/de";
import { PostEntity } from "../entity/Post.entity";
import { UserEntity } from "../entity/User.entity";

const usersCount = 10;
const postsPerUser = 25;

faker.seed(42);
/**
 * Generate some test data for the blog.
 */
export async function generate() {
    const usersInDbAtStart = await AppDataSource.manager.getRepository(UserEntity).count();
    if (usersInDbAtStart !== 0) {
        console.log("Test data is already generated.");
        return;
    }

    Array.from({length: usersCount}).forEach(() => {
        createRandomUser().then(user => {
            Array.from({length: postsPerUser}).forEach(() => {
                createRandomPost(user).then();
            });
        });
    });
}

/**
 * Creates a user.
 */
export async function createRandomUser(): Promise<UserEntity> {
    try {
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const user: UserEntity = {
            username: `${firstName}${lastName}`,
            email: faker.internet.email(firstName, lastName),
            firstName: firstName,
            lastName: lastName
        }
        return AppDataSource.manager.getRepository(UserEntity).save(user);
    } catch (e) {
        console.log("Error creating user", e)
    }
    return new Promise(() => null);
}

/**
 * Creates a post.
 * @param createdBy the User who created the post.
 */
export async function createRandomPost(createdBy: UserEntity): Promise<PostEntity> {
    try {
        const dirty = faker.lorem.sentences(29);
        const sanitized = await sanitizeHtml(dirty);
        const post: PostEntity = {
            title: faker.lorem.sentence(4),
            description: faker.lorem.sentences(8),
            markdown: dirty,
            createdBy: createdBy,
            createdAt: faker.date.recent(),
            sanitizedHtml: sanitized,
        };
        const postRep = AppDataSource.manager.getRepository(PostEntity);
        return (await postRep.save(post));
    } catch (e) {
        console.log("Error generating post");

    }
    return new Promise(() => null);
}
