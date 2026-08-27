import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("HireEdge interface error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error">
          <p>HIREEDGE</p>
          <h1>We could not load this screen.</h1>
          <span>Your data is safe. Reload the page to continue.</span>
          <button type="button" onClick={() => window.location.reload()}>Reload HireEdge</button>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
