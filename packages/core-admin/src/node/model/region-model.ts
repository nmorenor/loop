import { injectable } from 'inversify';
import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import { RegionAttributes } from '../../common/services/regions';
import { SequelizeModelContribution } from '../data-models-manager';

interface RegionCreationAttributes extends Optional<RegionAttributes, 'code'> {}

export class Region extends Model<RegionAttributes, RegionCreationAttributes> implements RegionAttributes {
    public code!: string;
    public name!: string;
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
