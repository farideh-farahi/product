import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Product } from './product';

export class Brand extends Model<InferAttributes<Brand>,InferCreationAttributes<Brand>>{
  declare id: CreationOptional<number>;
  declare name: string

  static associate(models:any) {
      this.hasMany(models.Product, { foreignKey: 'brandId', onDelete: "CASCADE" });
    }

  static initModel(sequelize: Sequelize): typeof Brand{
  Brand.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Brand',
      timestamps: true,
    }
  );

  return Brand;
}
};
