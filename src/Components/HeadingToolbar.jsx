import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';

class HeadingToolbar extends Component {
    render() {
      var headingToolbarMain;
      if(this.props.headingToolbarType === 'list') {
        headingToolbarMain =
          <div className="HeadingToolbar-column AppColumn main row">
            <div className="HeadingToolbar-selectAll">
              <input type="checkbox" name="SelectAll" />
            </div>
            <div className="HeadingToolbar-paging Paging">
                {/*
                <span className="Paging-actualMessages">
                1 - 50
              </span>
              <span className="Paging-of">&nbsp;of&nbsp;</span>
              <span className="Paging-totalMessages">90</span>
              <nav className="Paging-PagingNav Paging-nav">
                <a href="#" className="PagingNav-prev">&lt;</a>
                <a href="#" className="PagingNav-next">&gt;</a>
              </nav>
                */}
            </div>
          </div>;
      } else {
        headingToolbarMain =
          <div className="HeadingToolbar-column AppColumn main row">
            <div className="HeadingToolbar-goBack">
              <button type="button" name="back" className="HeadingToolbar-goBack-button Button" onClick={browserHistory.goBack}></button>
            </div>
            <div className="HeadingToolbar-paging Paging">
              {/*
                <span className="Paging-actualMessages">
                1 - 50
              </span>
              <span className="Paging-of">&nbsp;of&nbsp;</span>
              <span className="Paging-totalMessages">90</span>
              <nav className="Paging-PagingNav Paging-nav">
                <a href="#" className="PagingNav-prev">&lt;</a>
                <a href="#" className="PagingNav-next">&gt;</a>
              </nav>
                */}
            </div>
          </div>;
      }
  
      console.log(this.props);
      return (
        <section className="HeadingToolbar Wrapper">
          <div className="AppColumn left">
            <Link to="/compose" className="HeadingToolbar-composeEmail Button action">
              Compose
            </Link>
          </div>
          {headingToolbarMain}
        </section>
      );
    }
  }

  export default HeadingToolbar;