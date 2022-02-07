import { injectable } from 'inversify';
import { Group, User, UserGroupRelation } from './users-model';

@injectable()
export class UsersRepository {
    async upsertUser(email: string, password: string, groups?: Group[]): Promise<User | null> {
        await User.upsert({
            email,
            password
        });
        let user = await this.getUser(email);
        if (user && groups && groups.length) {
            for (const nextGroup of groups) {
                await UserGroupRelation.create({
                    user_id: user.id,
                    group_id: nextGroup.id
                });
            }
            user = await this.getUser(email);
        }
        return user;
    }
    async getUser(email: string): Promise<User | null> {
        return User.findOne({
            where: {
                email: email
            },
            include: [
                {
                    model: Group,
                    as: 'groups'
                }
            ]
        });
    }
    async getUserByID(id: number): Promise<User | null> {
        return User.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Group,
                    as: 'groups'
                }
            ]
        });
    }
    async hasUsers(): Promise<boolean> {
        const users = await User.count();
        return users > 0;
    }
    async setupGroups(): Promise<void> {
        const adminGroup = await this.getAdminGroup();
        const userGroup = await this.getUsersGroup();
        if (!adminGroup) {
            this.upsertGroup('admins');
        }
        if (!userGroup) {
            this.upsertGroup('users');
        }
    }
    async upsertGroup(name: string): Promise<Group | null> {
        await Group.upsert({
            name: name
        });
        return this.getGroupByName(name);
    }
    async getAdminGroup(): Promise<Group | null> {
        return this.getGroupByName('admins');
    }
    async getUsersGroup(): Promise<Group | null> {
        return this.getGroupByName('users');
    }
    async getGroupByName(name: string, full: boolean = false): Promise<Group | null> {
        if (full) {
            return await Group.findOne({
                where: {
                    name: name
                },
                include: [
                    {
                        model: User,
                        as: 'users'
                    }
                ]
            });
        }
        return await Group.findOne({
            where: {
                name: name
            }
        });
    }
}
