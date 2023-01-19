import { teamCollection, userCollection } from "../mongoDB/db.ts";
import { TeamSchema, UserSchema } from "../mongoDB/schema.ts";
import { MatchSchema } from "../mongoDB/schema.ts";

export const Match = {
    id: (parent: MatchSchema): string => parent._id.toString(),
    team1: async (parent: MatchSchema): Promise<TeamSchema | undefined> => {
        try {
            const team1 = await teamCollection.findOne({
                _id: parent.team1
            })
            if (!team1) throw new Error("Error no existe este team");
            return team1;
        } catch (e) {
            throw new Error(e)
        }
    },
    team2: async (parent: MatchSchema): Promise<TeamSchema | undefined> => {
        try {
            const team2 = await teamCollection.findOne({
                _id: parent.team2
            })
            if (!team2) throw new Error("Error no existe este team");
            return team2;
        } catch (e) {
            throw new Error(e)
        }
    },
    updatedBy: async (parent: MatchSchema): Promise<UserSchema> => {
        try {
            const user = await userCollection.findOne({
                _id: parent.updatedBy
            })
            if (!user) throw new Error("Nadie");

            return user;
        } catch (e) {
            throw new Error(e);

        }
    }
}