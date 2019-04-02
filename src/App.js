import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);


class App extends Component {

  constructor(props) {
    super(props);
    this.state = { votes: [] };
  }

  async componentDidMount() {
    try {
      const votes = await API.graphql(graphqlOperation(queries.listVotes))
      this.setState({
        votes: votes.data.listVotes.items
      })
    } catch (err) {
      console.log('error fetching votes...', err)
    }
  }

  candidates() {
    return this.state.votes.map(candidate =>
      <Candidate
        key={candidate.id}
        id={candidate.id}
        name={candidate.candidate}
      />);
  }


  render() {
    return this.candidates();
  }
}

class Candidate extends Component {

  handleSubmit = async (event) => {
    await event.preventDefault;
    console.log(event);
    return;
  };

  render() {
    return <button className="ui button" onClick={() => this.handleSubmit(this.props.id)}>{this.props.name}</button>;
  }
}


export default App;
