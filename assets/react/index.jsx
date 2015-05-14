var api_url = "https://loadshedding-api.herokuapp.com/zone";

var extend = function(out) {
  out = out || {};
  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }
  return out;
};

var App = React.createClass({

  ErrorLookup : [
    "Geolocation not supported in browser",
    "PERMISSION_DENIED - err code: 1",
    "POSITION_UNAVAILABLE - err code: 2",
    "TIMEOUT - err code: 3"
  ],
  NullStateObj : {
    zone : "...",
    answer : "?!?",
    messages : [],
    classes : 'app app--unknown',
    online : false,
    ready : true,
    next_date : "--|--"
  },

  geoLocate: function() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(this.geolocation_get, this.geolocation_fail, {timeout: 15000});
    } else {
      this.geolocation_fail( {code: 0} );
    }
  },
  geolocation_get: function(position) {
    var proxy = this;
    var ajax_url = api_url + "?long=" + position.coords['longitude'] + "&lat=" + position.coords['latitude'];
    var request = new XMLHttpRequest();

    request.open('GET', ajax_url, true);

    request.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 400) {
          var data = JSON.parse(this.responseText);
          var stateObj = extend( {}, proxy.NullStateObj, {
            zone : data,
            answer : 'On',
            messages : ['message'],
            power : true,
            classes : 'app app--on',
            online : true
          });
          proxy.debuglog('long: ' + position.coords['longitude'] + '  lat: ' + position.coords['latitude']);
          proxy.setState( stateObj );
        }
      }
    };
    request.send();
    request = null;
  },
  geolocation_fail: function(err) {
    var errorObj = { messages : [ "error" ] };
    var stateObj = extend( {}, this.NullStateObj, errorObj );
    this.debuglog(err);
    this.setState( stateObj );
  },
  debuglog: function(string) {
    string = string || ""
    this.setState({ debug  : string });
  },

  getInitialState: function() {
    return {
      classes : 'app app--waiting'
    };
  },
  componentDidMount: function() {
    this.geoLocate();
  },
  render: function() {
    var status;
    if (this.state.ready) {
      status = <ReadyApp data={this.state} />;
    } else {
      status = <UnReadyApp />;
    }
    return (
      <div>
        <div className={this.state.classes}>
          {status}
        </div>
        <div className="debugger">
          <DebugDisplay messages={this.state.debug} />
        </div>
      </div>
    );
  }
});

var ReadyApp = React.createClass({
  render: function() {
    return (
      <div>
        <Navigation />
        <Answer data={this.props.data} />
        <NextUp date={this.props.data.next_date}
                times={this.props.data.next_times}
                power={this.props.data.power}
                online={this.props.data.online} />
      </div>
    );
  }
});

var UnReadyApp = React.createClass({
  render: function() {
    return (
      <div className="loading">Determining location&hellip;</div>
    );
  }
});

var Navigation = React.createClass({
  render: function() {
    return (
      <div className="navigation">
        <a href="#">1</a>
        <a href="#">2</a>
        <a href="#">3</a>
        <a href="#">4</a>
      </div>
    );
  }
});

var Answer = React.createClass({
  render: function() {
    return (
        <div className="answer">
          <p>the power in</p>
          <LocationPicker zone={this.props.data.zone} power={this.props.data.power} />
          <AnswerText answer={this.props.data.answer} power={this.props.data.power} />
          <CountDown />
          <Messages messages={this.props.data.messages} />
        </div>
    );
  }
});

var AnswerText = React.createClass({
  render: function() {
    return (
      <div className="answer--wrapper">
        <span className="answer--is">is</span>
        <span className="answer--answer">{this.props.answer}</span>
      </div>
    );
  }
});

var Messages = React.createClass({
  render: function() {
    var message = this.props.messages[Math.floor(Math.random()*this.props.messages.length)];
    return (
        <div className="message">{message}</div>
    );
  }
});

var NextUp = React.createClass({
  render: function() {
    var classes = "nextup";
    var times;
    if (this.props.times) {
      times = this.props.times.map(function (time) {
        return (
          <NextUpTime key={time} time={time} />
        );
      });
    }
    classes += (this.props.power ? " nextup--on" : " nextup--off");
    return (
      <div className={classes}>
        <div className="container">
          <div className="nextup--header">Next power cut</div>
          <div className="nextup--row">
            <div className="nextup--date">{this.props.date}</div>
            <div className="nextup--times">
              {times}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var NextUpTime = React.createClass({
  render: function() {
    return (
      <div className="nextup--time">{this.props.time}</div>
    );
  }
});

var CountDown = React.createClass({
  render: function() {
    return (
      <span></span>
    );
  }
});

var LocationPicker = React.createClass({
  render: function() {
    var classes = "location";
    classes += (this.props.power ? " location--on" : " location--off");

    return (
      <div className={classes}>
        <svg xmlns="http://www.w3.org/2000/svg" className="i-pin" preserveAspectRatio="xMidYMid meet" viewBox="0 0 750 1000">
          <path className="i-outer" d="M0 375q0-156.2 109.4-265.6t265.6-109.4 265.6 109.4 109.4 265.6q0 78.1-28.3 160.1t-85 166-100.6 140.6-110.3 132.8q-19.5 25.4-48.8 25.4l-3.9 0q-29.3 0-48.8-25.4-66.4-76.2-110.3-132.8t-100.6-140.6-85-166-28.3-160.1z" />
          <path className="i-inside" d="M62.5 390q0 72.3 28.3 150.4t85 160.1 94.7 128.9 100.6 119.1l2 0q2 2 2 3.9l3.9-3.9q62.5-72.3 99.6-119.1t94.7-128.9 85.9-160.1 28.3-150.4q0-128.9-91.8-220.7t-220.7-91.8-220.7 91.8-91.8 220.7zm125-7.8q0-78.1 54.7-132.8t132.8-54.7 132.8 54.7 54.7 132.8-54.7 132.8-132.8 54.7-132.8-54.7-54.7-132.8z" fill="#FFF" />
          <path className="i-dot" d="M220 390q0 64.4 45.9 110.3t110.3 45.9 110.3-45.9 45.9-110.3-45.9-110.3-110.3-45.9-110.3 45.9-45.9 110.3z" fill="#fff" />
        </svg>
        {this.props.zone}
      </div>
    );
  }
});

var DebugDisplay = React.createClass({
  render: function() {
    var block;
    if (this.props.messages) {
      block = <code><pre>{this.props.messages}</pre></code>;
    } else {
      block = null;
    }
    return (
      <div>{block}</div>
    );
  }
});

React.render(
  <App />,
  document.getElementById('content')
);
