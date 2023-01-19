import { gql } from "graphql_tag";

export const typeDefs = gql`

type User {
    id: ID!
    username: String!
    email: String!
    name: String!
    surname: String!
    token: String
}

type Team{
  id: ID!
  name: String!
  matches: [Match!]!
  players: [Player!]!
  goals_for:Int!
  goals_against:Int!
  classified: Boolean!
  updatedBy: User!
}

enum MatchStatus {
    PENDING
    FINISHED
    PLAYING
  }

type Match{
  id: ID!
  team1: Team!
  team2: Team!
  goals_team1: Int!
  goals_team2: Int!
  date: String!
  status: MatchStatus
  updatedBy: User!
}

type Player{
  id:ID!
  name:String!
  team: Team
  updatedBy: User!
}
type Query {
    Me: User!
    hello: String
    team(id:ID!):Team!
    teams:[Team!]
    player(id:ID!):Player!
    players:[Player!]
    match(id:ID!):Match!
    matches:[Match!]
  }
type Mutation{
    login(username: String!, password: String!): String!
    register(
      username: String!,
      email: String!,
      password: String!,
      name: String!,
      surname: String!
    ): User!
    createTeam(name:String!, players:[ID!], classified: Boolean!): Team!
    createPlayer(name:String!):Player!
    updateTeam(id:ID!, players:[ID!], classified: Boolean): Team!
    deletePlayer(id:ID!):Player!
    createMatch(team1:ID!,team2:ID!,goals_team1:Int!,goals_team2:Int!,date:String!,status:MatchStatus!):Match!
    updateMatch(id:ID!,goals_team1:Int,goals_team2:Int,status:MatchStatus):Match!
    deleteMatch(id:ID!):Match!
}
`