import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";

export class Gallery extends Model<
  InferAttributes<Gallery>,
  InferCreationAttributes<Gallery>
> {
  declare id: CreationOptional<number>;
  declare fileImageId: number;
  declare productId: number;

  static associate(models: any) {
    this.belongsTo(models.FileImage, { foreignKey: "fileImageId" });
    this.belongsTo(models.Product, { foreignKey: "productId" });
  }

  static initModel(sequelize: Sequelize): typeof Gallery {
    Gallery.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        fileImageId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        productId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Gallery",
        tableName: "Gallery",
        timestamps: true,
      }
    );

    return Gallery;
  }
}
