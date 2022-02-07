import { injectable } from 'inversify';
import { GroupAttributes, UserAttributes } from '@loop/core/src/common/services/users';
import { DataTypes, Model, Sequelize, Optional, Association } from 'sequelize';
import { SequelizeModelContribution } from '../data-models-manager';

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public readonly groups?: Group[];
    public static associations: {
        groups: Association<User, Group>;
    };
}
@injectable()
export class UserModelContribution implements SequelizeModelContribution {
    initialize(sequelize: Sequelize): void {
        User.init({
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                field: 'id',
                autoIncrement: true,
                primaryKey: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'email'
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'password'
            }
        }, {
            sequelize: sequelize,
            modelName: 'User',
            tableName: 'USER',
            timestamps: false
        });
    }
    configure(sequelize: Sequelize): void {
        User.belongsToMany(Group, {
            as: 'groups',
            through: 'UserGroupRelation',
            foreignKey: 'user_id'
        });
        User.sync();
    }
}

interface GroupCreationAttributes extends Optional<GroupAttributes, 'id'> {}

export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
    public id!: number;
    public name!: string;
    public readonly users?: User[];
    public static associations: {
        users: Association<Group, User>;
    };
}
@injectable()
export class GroupModelContribution implements SequelizeModelContribution {
    initialize(sequelize: Sequelize): void {
        Group.init({
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                field: 'id',
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'name'
            }
        }, {
            sequelize: sequelize,
            modelName: 'Group',
            tableName: 'group',
            timestamps: false
        });
    }
    configure(sequelize: Sequelize): void {
        Group.belongsToMany(User, {
            as: 'users',
            through: 'UserGroupRelation',
            foreignKey: 'group_id'
        });
        Group.sync();
    }
}

export class UserGroupRelation extends Model {

}

@injectable()
export class UserGroupRelationModelContribution implements SequelizeModelContribution {
    initialize(sequelize: Sequelize): void {
        UserGroupRelation.init(
            {
            },
            {
                sequelize: sequelize,
                modelName: 'UserGroupRelation',
                tableName: 'group_membership',
                timestamps: false,
                underscored: true
            }
        );
    }
    configure(sequelize: Sequelize): void {
        UserGroupRelation.sync();
    }
}
