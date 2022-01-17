import { injectable } from 'inversify';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { SequelizeModelContribution } from '../data-models-manager';
export class Region extends Model {
    // such empty
}

export class SubRegion extends Model {
    // such empty
}

@injectable()
export class ContinentModelContribution implements SequelizeModelContribution {
    initialize(sequelize: Sequelize): void {
        Region.init({
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'code',
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'name'
            }
        }, {
            sequelize: sequelize,
            modelName: 'Region',
            tableName: 'REGION',
            timestamps: false
        });
    }
    configure(sequelize: Sequelize): void {
        Region.sync();
    }
}
