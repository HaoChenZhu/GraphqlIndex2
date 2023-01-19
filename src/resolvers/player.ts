import { PlayerSchema, TeamSchema, UserSchema } from "../mongoDB/schema.ts";
import { ObjectId } from "mongo";
import { teamCollection, userCollection } from "../mongoDB/db.ts";
import { Team } from "./team.ts";

export const Player = {
    id: (parent: PlayerSchema): string => parent._id.toString(),
    updatedBy: async (parent: PlayerSchema): Promise<UserSchema> => {
        try {
            const user = await userCollection.findOne({
                _id: new ObjectId(parent.updatedBy)
            })
            if (!user) throw new Error("ca")
            return user
        } catch (e) {
            throw new Error(e);
        }
    },
    team: async (parent: PlayerSchema): Promise<TeamSchema | undefined> => {
        try {
            const team = await teamCollection.findOne({
                players: parent._id
            })
            return team
        } catch (e) {
            throw new Error(e);

        }
    }
}