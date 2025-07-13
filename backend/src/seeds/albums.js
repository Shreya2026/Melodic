import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { config } from "dotenv";

config();

const seedDatabase = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL);

		// Clear existing data
		await Album.deleteMany({});
		await Song.deleteMany({});

		// First, create all songs
		const createdSongs = await Song.insertMany([
			{
				title: "Banjo",
				artist: "Vishal Shekhar",
				imageUrl: "/cover-images/1.jpg",
				audioUrl: "/songs/1.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 256
			},
			{
				title: "Sanam Re",
				artist: "Arijit Singh",
				imageUrl: "/cover-images/2.jpg",
				audioUrl: "/songs/2.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 325,
			},
			{
				title: "LoveYatri",
				artist: "Tanishk Bagchi",
				imageUrl: "/cover-images/3.jpg",
				audioUrl: "/songs/3.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 214,
			},
			{
				title: "Dil Dosti Dilemma",
				artist: "Cyber Pulse",
				imageUrl: "/cover-images/4.jpg",
				audioUrl: "/songs/4.mp3",
				plays: Math.floor(Math.random() * 5000),
				duration: 216,
			},
		]);

		// Create albums with references to song IDs
		const albums = [
			{
				title: "Banjo",
				artist: "Vishal Shekhar",
				imageUrl: "/cover-images/1.jpg",
				releaseYear: 2016,
				songs: createdSongs.slice(0, 4).map((song) => song._id),
			},
			{
				title: "Sanam Re",
				artist: "Arijit Singh",
				imageUrl: "/cover-images/2.jpg",
				releaseYear: 2016,
				songs: createdSongs.slice(4, 8).map((song) => song._id),
			},
			{
				title: "LoveYatri",
				artist: "Tanishk Bagchi",
				imageUrl: "/cover-images/3.jpg",
				releaseYear: 2018,
				songs: createdSongs.slice(8, 11).map((song) => song._id),
			},
			{
				title: "Dil Dosti Dilemma",
				artist: "Cyber Pulse",
				imageUrl: "/cover-images/4.jpg",
				releaseYear: 2024,
				songs: createdSongs.slice(11, 14).map((song) => song._id),
			},
		];

		// Insert all albums
		const createdAlbums = await Album.insertMany(albums);

		// Update songs with their album references
		for (let i = 0; i < createdAlbums.length; i++) {
			const album = createdAlbums[i];
			const albumSongs = albums[i].songs;

			await Song.updateMany({ _id: { $in: albumSongs } }, { albumId: album._id });
		}

		console.log("Database seeded successfully!");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		mongoose.connection.close();
	}
};

seedDatabase();