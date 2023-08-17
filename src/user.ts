import prisma from "../lib/prisma";
import express from "express";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
