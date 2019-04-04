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
    this.state = {
      votes: [],
      votes_new: {
        "e1438020-bd8f-45c7-9d94-0e40e1eadadf": { counter: 0 },
        "8e28f53b-7988-439e-bfa8-d2b429378cc0": { counter: 0 },
        "2c7672d2-65ec-4a92-8aef-5d732dc2642d": { counter: 0 },
        "0df14032-e1a4-48f4-be33-12aaf8706d0d": { counter: 0 }
      }
    };
  };

  async componentDidMount() {
    console.log("state before:", this.state)
    try {
      const votes = await API.graphql(graphqlOperation(queries.listVotes))
      this.setState({
        votes: votes.data.listVotes.items
      })
      console.log("state:", this.state)
      console.log("items", votes.data.listVotes.items);
    } catch (err) {
      console.log('error fetching votes...', err)
    }

    const subscription = API.graphql(
      graphqlOperation(subscriptions.onUpdateVote)
    ).subscribe({
      next: (updateData) => {
        const id      = updateData.value.data.onUpdateVote.id
        const counter = updateData.value.data.onUpdateVote.counter
        console.log("id", id);
        console.log("counter", counter);
        let new_val = {"counter": counter }
        // console.log("new val:", new_val);
        var existing_state = {...this.state.votes_new}
        existing_state[id] = new_val
        this.setState({
          votes_new: existing_state
        });
        console.log("state after:", this.state);
      }
    })
  }

  candidates() {
    return this.state.votes.map(candidate =>
      <Candidate
        key={candidate.id}
        id={candidate.id}
        name={candidate.candidate}
        counter={this.state.votes_new[candidate.id].counter}
      />);
  }


  render() {
    return this.candidates();
  }
}

class Candidate extends Component {

  handleSubmit = async (event) => {
    await event.preventDefault;
    const castVote = {
      id: event,
      counter: Math.floor(Math.random() * Math.floor(1000))
    };

    const newEvent = await API.graphql(graphqlOperation(mutations.updateVote, {input: castVote}));
    console.log(JSON.stringify(newEvent));
  };

  render() {
    console.log("props", this.props)
    return (
      <div>
        {this.props.counter}
        <button className="ui button" onClick={() => this.handleSubmit(this.props.id)}>{this.props.name}</button>
      </div>
    );
  }
}


export default App;
