import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class Subcategory extends Model<
  InferAttributes<Subcategory>,
  InferCreationAttributes<Subcategory>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare categoryId: ForeignKey<number>;

  static associate(models: any) {
    this.belongsTo(models.Category, {
      foreignKey: "categoryId",
      onDelete: "CASCADE",
    });

    this.belongsToMany(models.Product, {
      through: "ProductSubcategories",
      foreignKey: "subcategoryId",
    });
  }

  static initModel(sequelize: Sequelize): typeof Subcategory {
    Subcategory.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        categoryId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Subcategory",
        timestamps: true,
      }
    );

    return Subcategory;
  }
}
