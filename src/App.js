import React, { Component } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { Bar } from 'react-chartjs-2';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';
import aws_exports from './aws-exports';
import classNames from 'classnames';


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
    const candidateColors = ["red", "orange", "green", "blue"]
    return this.state.votes.map((candidate,idx) =>
      <Candidate
        key={candidate.id}
        id={candidate.id}
        name={candidate.candidate}
        counter={candidate.counter}
        color={candidateColors[idx]}
      />
    )
  };

  render() {
    return (
      <div className="App flex flex-wrap">
        <div className="w-full sm:w-2/5 px-3 pb-4" style={{backgroundColor: '#232F3E'}}>
          <h1 className="text-grey-lighter text-xl my-6">Polling booth</h1>
          <div className="text-grey-lighter italic my-6">Which is your favourite AWS serverless service?</div>
          <div className="flex abg-grey-lighter pb-2">
            {this.candidates()}
          </div>
        </div>
        <div className="w-full sm:w-3/5 p-4">
          <h1 className="text-xl text-grey-darkest pb-6">Live polling updates</h1>
          <Chart data={this.state.votes}></Chart>
        </div>
      </div>
    )
  }
}

class Chart extends React.Component {
  render() {
    const fontStack = '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
    const data = {
      labels: this.props.data.map((vote) => ( vote.candidate )),
      datasets: [{
        label: false,
        data: this.props.data.map((vote) => ( vote.counter )),
        backgroundColor: ['#CC1F1A', '#DE751F', '#1F9D55', '#2779BD']
      }]
    };
    const options = {
      title:    {display: false },
      legend:   {display: false },
      tooltips: {enabled: false },
      layout:   {padding: {top: 10 }},
      scales: {
        xAxes: [{gridLines: {display: false }, ticks: {fontStyle: 'bold', fontColor: '#3D4852', fontFamily: fontStack}}],
        yAxes: [{ticks: {beginAtZero: true, maxTicksLimit: 6, fontStyle: 'normal', fontColor: '#3D4852', fontFamily: fontStack}}]
      }
    }
    return (
      <Bar data={data} width={100} height={50} options={options} />
    );
  }
}

class Candidate extends Component {
  handleSubmit = async (event) => {
    await event.preventDefault;
    const castVote = {
      id: event.id
    };
    const newEvent = await API.graphql(graphqlOperation(mutations.castVote, {input: castVote}));
  };

  render() {
    console.log("props", this.props)
    const classes = classNames('flex-1', 'text-white', 'py-2', 'px-3', 'mx-1', 'text-sm', 'rounded', 'bg-' + this.props.color + '-dark', 'hover:bg-' + this.props.color + '-lighter');
    return (
      <button className={classes} onClick={() => this.handleSubmit(this.props)}>{this.props.name}</button>
    );
  }
}

export default App;
