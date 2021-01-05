import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { TreeNode } from './node';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';
import { deepClone, IntervalUtils } from './utils';

export interface TreeNodeValueProps {
  current: boolean;
  checked: boolean;
  onPush: boolean;
}

export interface TreeNodeValue {
  component: TreeNodeComponent | null;
  props: TreeNodeValueProps;
}

export class TreeNodeAsComponent extends TreeNode<TreeNodeValue> {
  value$ = new BehaviorSubject<TreeNodeValue>(this.value);
  children$ = new BehaviorSubject<TreeNodeAsComponent[]>(this.children);

  defaultValue = {
    component: null,
    props: {
      current: false,
      checked: false,
      onPush: true,
    }
  };

  deepCloneValueFunc(val: TreeNodeValue): TreeNodeValue {
    return {
      component: val.component,
      props: deepClone(val.props)
    };
  }

  onValueChange(val: TreeNodeValue): void {
    this.value$.next(val);
  }

  onChildrenChange(val: TreeNodeValue, children: TreeNodeAsComponent[]): void {
    this.children$.next(children);
  }
}

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  root!: TreeNodeAsComponent;
  history: TreeNodeAsComponent[] = [];
  prevHistory: TreeNodeAsComponent[] = [];
  depth = new BehaviorSubject<number>(0);
  currentNode = new BehaviorSubject<TreeNodeAsComponent | null>(null);

  enableRecording = new BehaviorSubject<boolean>(false);
  record = false;
  intervalUtils = new IntervalUtils();

  constructor() {
    this.root = new TreeNodeAsComponent();
    this.root.setup(null, null, [], [0]);

    this.root.generateNodes(5, 2);
    this.depth.next(this.root.getDepth());
    // interval(100).subscribe(() => {
    //   const randomNode = this.root.getRandomNode();
    //   if (randomNode) {
    //     this.changeCurrentNode(randomNode);
    //   }
    // });
  }

  startRecording(): void {
    this.intervalUtils.stop();
    this.prevHistory = [ ...this.history];
    this.history = [];
    this.record = true;
  }

  onCheck(node: TreeNodeAsComponent): void {
    if (this.record && this.enableRecording.value) {
      this.history.push(node);
    }
  }

  stopRecording(): void {
    this.record = false;
  }

  toggleRecording(): void {
    this.enableRecording.next(!this.enableRecording.value);
  }

  reset(): void {
    this.history.forEach(n => this.changeProps(n, { checked: false }));
    this.history = [];
  }

  changeProps(node: TreeNodeAsComponent, props: Partial<TreeNodeValueProps>): void {
    node.changeValue({ props: { ...node.value.props, ...props }});
  }

  showChecked(): void {
    this.prevHistory.forEach(n => this.changeProps(n, { checked: false }));

    this.intervalUtils.overArray(this.history, (historyItem) => {
      historyItem.value.component?.shakeAnimation();
      this.changeProps(historyItem, { checked: true });
    }, 100);
  }

  addNode(node: TreeNodeAsComponent): void {
    this.currentNode.value?.addChild(node);
    this.depth.next(this.root.getDepth());
  }

  removeNode(): void {
    const node = this.currentNode.value;
    if (node && node?.parent) {
      node.parent.removeChild(node);
      this.changeCurrentNode(this.getNextAvailableNodeAfterDeletion(node));
      this.depth.next(this.root.getDepth());
    }
  }

  getNextAvailableNodeAfterDeletion(removedNode: TreeNodeAsComponent): TreeNodeAsComponent {
    if (removedNode.parent) {
      if (removedNode.parent.children.length > 0) {
        return removedNode.parent.children[removedNode.parent.children.length - 1];
      }
      return removedNode.parent;
    } else {
      throw new Error('removed node does not have a parent');
    }
  }

  changeCurrentNode(node: TreeNodeAsComponent): void {
    const currentNode = this.currentNode.value;
    if (currentNode === node) {
      this.changeProps(currentNode, { current : !currentNode.value.props.current });
      this.currentNode.next(null);
    } else {
      if (currentNode) {
        this.changeProps(currentNode, { current : !currentNode.value.props.current });
      }
      this.changeProps(node, { current : !node.value.props.current });
      this.currentNode.next(node);
    }
  }
}
