const sequelize = require('../database')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING, unique: true,},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
});

const Landmark = sequelize.define('landmark', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: false},
    location: {type: DataTypes.STRING, allowNull: false},
    category_name: {type: DataTypes.STRING, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
});

const Category = sequelize.define('category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
})

const Review = sequelize.define('review', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    rating: {type: DataTypes.INTEGER, allowNull: false},
    comment: {type: DataTypes.TEXT, allowNull: false},
});

User.hasMany(Review)
Review.belongsTo(User)

Landmark.hasMany(Review)
Review.belongsTo(Landmark)

Category.hasMany(Landmark)
Landmark.belongsTo(Category)

module.exports = {
    User,
    Landmark,
    Review,
    Category,
}