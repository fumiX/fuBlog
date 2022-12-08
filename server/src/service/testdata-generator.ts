import {User} from "../entity/User";
import {AppDataSource} from "../data-source";
import {Post} from "../entity/Post";
import {sanitizeHtml} from "../markdown-converter-server";
import { faker } from "@faker-js/faker/locale/de";

const usersCount = 10;
const postsPerUser = 25;

faker.seed(42);
/**
 * Generate some test data for the blog.
 */
export async function generate() {
    const usersInDbAtStart = await AppDataSource.manager.getRepository(User).count();
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
export async function createRandomUser(): Promise<User> {
    try {
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const user: User = {
            birthdate: faker.date.birthdate(),
            email: faker.internet.email(firstName, lastName),
            firstName: firstName,
            lastName: lastName
        }
        return AppDataSource.manager.getRepository(User).save(user);
    } catch (e) {
        console.log("Error creating user", e)
    }
    return new Promise(() => null);
}

/**
 * Creates a post.
 * @param createdBy the User who created the post.
 */
export async function createRandomPost(createdBy: User): Promise<Post> {
    try {
        const dirty = faker.lorem.sentences(29);
        const sanitized = await sanitizeHtml(dirty);
        const post: Post = {
            title: faker.lorem.sentence(4),
            description: faker.lorem.sentences(8),
            markdown: dirty,
            createdBy: createdBy,
            createdAt: faker.date.recent(),
            sanitizedHtml: sanitized,
        };
        const postRep = AppDataSource.manager.getRepository(Post);
        return (await postRep.save(post));
    } catch (e) {
        console.log("Error generating post");

    }
    return new Promise(() => null);
}
