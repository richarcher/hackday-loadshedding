var stage = {
  "1" : 0,
  "2" : 1,
  "3a" : 2,
  "3b" : 3
};
var current_stage = stage['3b'];
var day = new Date;
var getZone = function( data, position ) {
  var mapOptions = {
    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
    zoom: 12
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  var areaNumber;

  //for each load shedding area
  $.each(data.PlaceMarks, function (i, v) {

      //each polygon to be drawn to represent the load shedding area
      $.each(v.MultiGeometry.Polygons, function (i2, v2) {
          var boundaryCoordinates = [];

          $.each(v2.OuterBoundaryIs.LinearRing.Coordinates, function (i3, v3) {
              var temp = new google.maps.LatLng(v3.Latitude, v3.Longitude);
              boundaryCoordinates.push(temp);
          });

          var boundary = new google.maps.Polygon({
              paths: boundaryCoordinates,
              strokeOpacity: 'ff',
              strokeWeight: 1,
              fillOpacity: 0.35
          });
          var bounds = new google.maps.LatLngBounds();
          var i;

          for (i = 0; i < boundaryCoordinates.length; i++) {
              bounds.extend(boundaryCoordinates[i]);
          }

          boundary.setMap(map);
          if (google.maps.geometry.poly.containsLocation(mapOptions.center, boundary)) {
            areaNumber = v.Name;
          }
      });

      if (areaNumber !== undefined) {
        return false;
      }
  });
  return {data: data, zone: areaNumber };
};

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var App = React.createClass({
  geolocation_get: function(position) {
    var proxy = this;
    var getRandomFixture = function(min, max) {
      // var fix = "fixtures/fixture-schedule1.json";
      // var fix = "fixtures/fixture-schedule2.json";
      // return fix;
      return 'assets/fixtures/fixture-schedule' + (Math.floor(Math.random() * (max - min)) + min) + '.json';
    };
    var getZone = function(a,b) {
      return { 'zone': "Zone 11" };
    };
    $.getJSON( 'assets/fixtures/zones.js', function( data ) {
      $.when( getZone( data, position ) ).done(function( data ) {
        $.getJSON( getRandomFixture(1,3), { 'zone' : data.zone }, function( response ) {
          var state_class = response.power ? 'app--on' : 'app--off' ;
          proxy.setState({
            zone : data.zone,
            answer : response.being_loadshed_text,
            messages : response.messages,
            classes : 'app ' + state_class,
            power : response.power,
            next_date : response.next_date,
            next_times : response.next_times,
            online : true,
            ready : true
          });
        });
      });
    });
  },
  geolocation_fail: function(a, b) {
    this.setState({
      zone : "...",
      answer : "?!?",
      messages : ["We've got no idea.. please check your connection and try again."],
      classes : 'app app--unknown',
      online : false,
      ready : true,
      next_date : "--|--"
    });
  },
  geoLocate: function() {
    if ("geolocation" in navigator) {
      var geolocation_options = {
        enableHighAccuracy  : true,
        maximumAge          : 30000,
        timeout             : 7000
      };
      navigator.geolocation.getCurrentPosition(this.geolocation_get);
    } else {
      this.geolocation_fail();
    }
  },
  getInitialState: function() {
    return {
      classes : 'app app--waiting',
      mounted : false
    };
  },
  componentDidMount: function() {
    this.geoLocate();
    this.setState({ mounted : true });
  },
  render: function() {
    var status;
    if (this.state.ready) {
      status = <ReadyApp data={this.state} />;
    } else {
      status = <UnReadyApp />;
    }
    return (
      <div className={this.state.classes}>
        {status}
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
        <NextUp date={this.props.data.next_date} times={this.props.data.next_times} power={this.props.data.power} online={this.props.data.online} />
      </div>
    );
  }
});

var UnReadyApp = React.createClass({
  render: function() {
    return (
      <div className="loading">Loading&hellip;</div>
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
  getInitialState: function() {
    return { mounted: false };
  },
  componentDidMount: function() {
    this.setState({ mounted : true });
  },
  render: function() {
    var child;
    if (this.state.mounted) {
      child =
        <div className="answer">
          <p>the power in</p>
          <LocationPicker zone={this.props.data.zone} power={this.props.data.power} />
          <AnswerText answer={this.props.data.answer} power={this.props.data.power} />
          <CountDown />
          <Messages messages={this.props.data.messages} />
        </div>
    } else {
      child = null
    }
    return (
      <ReactCSSTransitionGroup transitionName="transition--a">
        {child}
      </ReactCSSTransitionGroup>
    );
  }
});

var AnswerText = React.createClass({
  getInitialState: function() {
    return { mounted: false };
  },
  componentDidMount: function() {
    this.setState({ mounted : true });
  },
  render: function() {
    var child;
    if (this.state.mounted) {
      child = <span className="answer--answer">{this.props.answer}</span>
    } else {
      child = null
    }
    return (
      <div className="answer--wrapper">
        <span className="answer--is">is</span>
          {child}
      </div>
    );
  }
});

var Messages = React.createClass({
  getInitialState: function() {
    return { mounted: false };
  },
  componentDidMount: function() {
    this.setState({ mounted : true });
  },
  render: function() {
    var message = this.props.messages[Math.floor(Math.random()*this.props.messages.length)]
    var child;
    if (this.state.mounted) {
      child = <div className="message">{message}</div>
    } else {
      child = null
    }
    return (
      <ReactCSSTransitionGroup transitionName="transition--b">
        {child}
      </ReactCSSTransitionGroup>
    );
  }
});

var NextUp = React.createClass({
  getInitialState: function() {
    return { mounted: false };
  },
  componentDidMount: function() {
    this.setState({ mounted : true });
  },
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
    if (this.state.mounted) {
      child = <div className={classes}>
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
    } else {
      child = null
    }
    return (
      <ReactCSSTransitionGroup transitionName="transition--a">
        {child}
      </ReactCSSTransitionGroup>
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
    var classes = "location"
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

React.render(
  <App />,
  document.getElementById('content')
);
