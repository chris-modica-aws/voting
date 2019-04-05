import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import aws_exports from './aws-exports';
import '../node_modules/react-vis/dist/style.css';
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  LabelSeries
} from 'react-vis';

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
      graphqlOperation(subscriptions.onUpdateVote)
    ).subscribe({
      next: (updateData) => {
        const id      = updateData.value.data.onUpdateVote.id
        const counter = updateData.value.data.onUpdateVote.counter
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
    return (
      <div className="App">
        {this.candidates()}
        <Chart votes={this.state.votes}></Chart>
      </div>
    )
  }
}

class Chart extends React.Component {


  render() {

    const colors = ["#FC0107", "#FECC66", "#108001", "#0F80FF"]
    const chartSeries = this.props.votes.map(
      (vote,idx) => ({
        x: vote.candidate,
        y: vote.counter,
        color: colors[idx]
      })
    );

    const labelData = chartSeries.map((d) => ({
      y: 100
    }));
    return (
      <div>
      <XYPlot xType="ordinal" width='450' height={450} xDistance={100} animation>
          <HorizontalGridLines />
          <XAxis style={{ text: {stroke: 'none', fill: '#6b6b76', fontWeight: 600, fontSize: 18 }}} />
          <YAxis style={{ text: {stroke: 'none', fill: '#6b6b76', fontWeight: 600, fontSize: 16 }}} />
          <VerticalBarSeries className="vertical-bar-series-example" data={chartSeries} colorType="literal" />
          <LabelSeries data={labelData} />
        </XYPlot>
      </div>
    );
  }
}

class Candidate extends Component {

  handleSubmit = async (event) => {
    await event.preventDefault;
    const castVote = {
      id: event.id,
      // counter: event.counter + 1
      counter: Math.floor(Math.random() * Math.floor(100))
    };

    const newEvent = await API.graphql(graphqlOperation(mutations.updateVote, {input: castVote}));
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
