import { playerCollection, userCollection } from "../mongoDB/db.ts"
import { PlayerSchema, UserSchema } from "../mongoDB/schema.ts"
import { TeamSchema } from "../mongoDB/schema.ts"
import { ObjectId } from "mongo";

export const Team = {
    id: (parent: TeamSchema): string => parent._id.toString(),
    updatedBy: async (parent: TeamSchema): Promise<UserSchema> => {
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
    players: async (parent: TeamSchema): Promise<PlayerSchema[]> => {
        try {

            const players = await playerCollection.find({
                _id: { $in: parent.players }
            }).toArray()
            console.log(players)
            return players
        } catch (e) {
            throw new Error(e);
        }
    }

}