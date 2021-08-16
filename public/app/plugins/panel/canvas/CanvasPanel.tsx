import { Component } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from './models.gen';
import { Scene } from './runtime/scene';
import { CanvasGroupOptions } from './base';
import { ReplaySubject } from 'rxjs';

interface Props extends PanelProps<PanelOptions> {}

interface State {
  refresh: number;
}

// Used to pass the scene to the editor functions
export const theScene = new ReplaySubject<Scene>(1);

export class CanvasPanel extends Component<Props, State> {
  readonly scene: Scene;

  constructor(props: Props) {
    super(props);
    this.state = {
      refresh: 0,
    };

    // Only the initial options are ever used.
    // later changs are all controled by the scene
    this.scene = new Scene(this.props.options.root, this.onUpdateScene);
    this.scene.updateSize(props.width, props.height);
    theScene.next(this.scene);

    this.scene.updateSize(props.width, props.height);
    this.scene.updateData(props.data);
  }

  componentDidMount() {
    theScene.next(this.scene);
  }

  // NOTE, all changes to the scene flow through this function
  // even the editor gets current state from the same scene instance!
  onUpdateScene = (root: CanvasGroupOptions) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      root,
    });
    this.setState({ refresh: this.state.refresh + 1 });
    console.log('send changes', root);
  };

  shouldComponentUpdate(nextProps: Props) {
    const { width, height, data, renderCounter } = this.props;
    let changed = false;

    if (width !== nextProps.width || height !== nextProps.height) {
      this.scene.updateSize(nextProps.width, nextProps.height);
      changed = true;
    }
    if (data !== nextProps.data) {
      this.scene.updateData(nextProps.data);
      changed = true;
    }

    if (renderCounter !== nextProps.renderCounter) {
      changed = true;
    }

    return changed;
  }

  render() {
    return this.scene.render();
  }
}