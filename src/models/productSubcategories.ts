import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
} from "sequelize";

export class ProductSubcategory extends Model<
  InferAttributes<ProductSubcategory>,
  InferCreationAttributes<ProductSubcategory>
> {
  declare productId: ForeignKey<number>;
  declare subcategoryId: ForeignKey<number>;

  static associate(models: any) {
    this.belongsTo(models.Product, {
      foreignKey: "productId",
      onDelete: "CASCADE",
    });
    this.belongsTo(models.Subcategory, {
      foreignKey: "subcategoryId",
      onDelete: "CASCADE",
    });
  }

  static initModel(sequelize: Sequelize): typeof ProductSubcategory {
    ProductSubcategory.init(
      {
        productId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        subcategoryId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "ProductSubcategory",
        timestamps: true,
      }
    );

    return ProductSubcategory;
  }
}
