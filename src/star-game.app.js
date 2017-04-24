import React from 'react';
import _ from 'underscore';
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';

import logo from './logo.svg';
import './assets/star-game.app.css';


var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

const Stars = (props) => {
  return (
    <div className="col-md-5">
      {_.range(props.numberOfStars).map(i =>
        <i key={i} className="fa fa-star large"></i>
      )}
    </div>
  );
};

const Button = (props) => {
	let button;
  switch(props.answerIsCorrect) {
  	case true:
    	button =
        <button className="btn btn-success" onClick={() => {props.acceptAnswer(); props.updateDoneStatus()}}>
          <i className="fa fa-check"></i>
        </button>;      
      break;
  	case false:
    	button =
        <button className="btn btn-danger" onClick={ () => {props.resetSelectedNumbers(); } }>
          <i className="fa fa-times"></i>
        </button>;      
      break;
  	default:
    	button =
        <button className="btn" 
        				onClick={props.checkAnswer}
        				disabled={props.selectedNumbers.length === 0}>
          =
        </button>;      
      break;
  }
  return (
    <div className="col-md-2">
      {button}
      <br /> <br />
      <button className="btn btn-warning btn-sm" onClick={props.redraw}
      				disabled={props.redrawCount === 0}>
      	<i className="fa fa-refresh"></i> {props.redrawCount}
      </button>
    </div>
  );
};

const Answer = (props) => {
  return (
    <div className="col-md-5">
      {props.selectedNumbers.map((number, i) =>
      	<span key={i} onClick={() => props.unselectNumber(number)}>
        	{number}
        </span>
      )}
    </div>
  );
};

const Numbers = (props) => {
	const numberClassName = (number) => {
		if (props.usedNumbers.indexOf(number) >= 0) {
    	return 'used';
    }  	
		if (props.selectedNumbers.indexOf(number) >= 0) {
    	return 'selected';
    }  	
  };
  return (
    <div className="card text-center">
      <div>
        {Numbers.list.map((number, i) =>
          <span key={i} className={numberClassName(number)}
          			onClick={() => props.selectNumber(number)}>
          	{number}
          </span>
        )}
      </div>
    </div>
  );
};

Numbers.list = _.range(1, 10);

const DoneFrame = (props) => {
	return (
  	<div className="text-center">
    	<h2>{props.doneStatus}</h2>
      {props.doneStatus ? 
      	<button className="btn btn-secondary" onClick={props.resetGame}>Play Again</button>: ''
      }      
    </div>
  );
};

class Game extends React.Component {

	static getRandomNumber = () =>  1 + Math.floor(Math.random()*9);

	static initialState = () => ({
    selectedNumbers: [],
    randomNumberOfStars: Game.getRandomNumber(),
    usedNumbers: [],
    answerIsCorrect: null,
    redrawCount: 5,
    doneStatus: null
  });
  
  state = Game.initialState();
  
  resetGame = () => this.setState(Game.initialState());
    
  selectNumber = (clickedNumber) => {
  	if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0 ||
    		this.state.usedNumbers.indexOf(clickedNumber) >= 0) { return; }
  	this.setState(prevState => ({
    	answerIsCorrect: null,
    	selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
    }));
  };
  unselectNumber = (clickedNumber) => {
  	this.setState(prevState => ({
    	answerIsCorrect: null,
    	selectedNumbers: prevState.selectedNumbers
      													.filter(number => number !== clickedNumber)
    }));
  };
  resetSelectedNumbers = () => {
    this.setState({
      answerIsCorrect: null,
      selectedNumbers: []
    })
  };
  checkAnswer = () => {
  	this.setState(prevState => ({
    	answerIsCorrect: prevState.randomNumberOfStars ===
      	prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
    }));
  };
  acceptAnswer = () => {
  	this.setState(prevState => ({
    	usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
      selectedNumbers: [],
      answerIsCorrect: null,
      randomNumberOfStars: Game.getRandomNumber(),
    }), this.updateDoneStatus);
  };
  redraw = () => {
  	if(this.state.redrawCount === 0){return; }
  	this.setState((prevState) => ({
      selectedNumbers: [],
      answerIsCorrect: null,
      randomNumberOfStars: Game.getRandomNumber(),
      redrawCount: prevState.redrawCount -1
    }), this.updateDoneStatus);
  };
  possibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
  	const possibleNumbers = _.range(1,10).filter(number =>
    	usedNumbers.indexOf(number) === -1
    );
    
    return possibleCombinationSum(possibleNumbers, randomNumberOfStars);
  };
  updateDoneStatus = () => {
  	this.setState( prevState => {
    	if(prevState.usedNumbers.length === 9 ){
      	return {doneStatus: 'Won the game!',
        				randomNumberOfStars: 0}
      }
      else if(prevState.redrawCount === 0 && !this.possibleSolutions(prevState)){
      	return {
        	doneStatus: 'Game Over :( '
        }
      }
    });
  };
  
  render() {
  	const { 
      selectedNumbers, 
      randomNumberOfStars, 
      answerIsCorrect,
      usedNumbers,
      redrawCount,
      doneStatus
    } = this.state;
    
    return (
      <div className="container-box">
        <h3>Play Nine</h3>
        <hr />
        <div className="row">
          <Stars numberOfStars={randomNumberOfStars} />
          <Button selectedNumbers={selectedNumbers}
          				checkAnswer={this.checkAnswer}
                  acceptAnswer={this.acceptAnswer}
                  resetSelectedNumbers={this.resetSelectedNumbers}
                  answerIsCorrect={answerIsCorrect}
                  redraw={this.redraw}
                  redrawCount={redrawCount}
                  updateDoneStatus={this.updateDoneStatus}/>
          <Answer selectedNumbers={selectedNumbers}
          				unselectNumber={this.unselectNumber} />
        </div>  
        <br />
        <Numbers selectedNumbers={selectedNumbers}
               selectNumber={this.selectNumber}
               usedNumbers={usedNumbers} />
        <br />
        <DoneFrame doneStatus={doneStatus}
        					 resetGame={this.resetGame}/>                              
      </div>
    );
  }
}

class StarGameApp  extends React.Component {
  render() {
    return (
      <div>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <Game />
      </div>
    );
  }
}

export default StarGameApp;