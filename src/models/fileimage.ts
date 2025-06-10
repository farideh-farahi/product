import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

export class FileImage extends Model<
  InferAttributes<FileImage>,
  InferCreationAttributes<FileImage>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare outputPath: string;

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });

    this.hasOne(models.Gallery, {
      foreignKey: "fileImageId",
      onDelete: "CASCADE",
    });

    this.hasOne(models.Product, {
      foreignKey: "cover",
      onDelete: "SET NULL",
    });
  }

  static initModel(sequelize: Sequelize): typeof FileImage {
    FileImage.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        outputPath: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "FileImage",
        timestamps: true,
      }
    );

    return FileImage;
  }
}
