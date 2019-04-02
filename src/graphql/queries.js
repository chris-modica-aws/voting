// eslint-disable
// this is an auto generated file. This will be overwritten

export const getVote = `query GetVote($id: ID!) {
  getVote(id: $id) {
    id
    candidate
    description
    counter
  }
}
`;
export const listVotes = `query ListVotes(
  $filter: ModelVoteFilterInput
  $limit: Int
  $nextToken: String
) {
  listVotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      candidate
      description
      counter
    }
    nextToken
  }
}
`;
