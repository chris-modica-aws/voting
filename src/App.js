import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import aws_exports from './aws-exports';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';

Amplify.configure(aws_exports);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votes: []
    };
  };

  async componentDidMount() {
    // console.log("state before:", this.state)
    try {
      const votes = await API.graphql(graphqlOperation(queries.listVotes))
      this.setState({
        votes: votes.data.listVotes.items
      })
      console.log("state:", this.state.votes)
    } catch (err) {
      console.log('error fetching votes...', err)
    }

    const subscription = API.graphql(
      graphqlOperation(subscriptions.onCastVote)
    ).subscribe({
      next: (updateData) => {
        const id      = updateData.value.data.onCastVote.id
        const counter = updateData.value.data.onCastVote.counter
        console.log("id", id)
        const votesh = this.state.votes
        const row = votesh.find( thing => thing.id === id );
        row.counter = counter;
        this.setState({ votes: votesh });
        console.log("state:", this.state.votes)
      }
    })
  }

  candidates() {
    return this.state.votes.map(candidate =>
      <Candidate
        key={candidate.id}
        id={candidate.id}
        name={candidate.candidate}
        counter={candidate.counter}
      />
    )
  };

  render() {
    var divStyle = {
      width: '100%',
      height: '600px'
    };
    return (
      <div className="App">
        {this.candidates()}
        <div style={divStyle}>
          <Chart data={this.state.votes}></Chart>
        </div>
      </div>
    )
  }
}

class Chart extends React.Component {
  render() {
    const colors = ["#FC0107", "#FECC66", "#108001", "#0F80FF"]
    const myData = this.props.data.map(
      (vote,idx) => ({
        candidate: vote.candidate,
        counter: vote.counter,
        color: colors[idx]
      })
    );

    return (
      <VictoryChart
        // domainPadding will add space to each side of VictoryBar to
        // prevent it from overlapping the axis
        domainPadding={{x: [50, 10]}}
        maxDomain={{ y: 100 }}
        height={300}
        width={300}
        >
        <VictoryAxis
          style={{
            axis: {stroke: "#756f6a"},
            ticks: {stroke: "grey", size: 0},
            tickLabels: {fontSize: 12, padding: 5, fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'}
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: {stroke: "#756f6a"},
            ticks: {stroke: "grey", size: 5},
            tickLabels: {fontSize: 12, padding: 5, fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'}
          }}
        />
        <VictoryBar
          barRatio={1}
          data={myData}
          alignment="middle"
          x="candidate"
          y="counter"
          style={{ data: {fill: (d) => d.color }}}
        />
      </VictoryChart>
    )
  }
}

class Candidate extends Component {

  handleSubmit = async (event) => {
    await event.preventDefault;
    const castVote = {
      id: event.id
    };

    const newEvent = await API.graphql(graphqlOperation(mutations.castVote, {input: castVote}));
    // console.log(JSON.stringify(newEvent));
  };

  render() {
    console.log("props", this.props)
    return (
      <div>
      {this.props.counter}
      <button className="ui button" onClick={() => this.handleSubmit(this.props)}>{this.props.name}</button>
      </div>
    );
  }
}

export default App;
