import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { TreeNode } from './node';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';
import { deepClone } from './utils';

export interface TreeNodeValueProps {
  current: boolean;
  checked: boolean;
}

export interface TreeNodeValue {
  component: TreeNodeComponent | null;
  props: TreeNodeValueProps;
}

function patchNode(node: TreeNode<TreeNodeValue>): void {
  node.defaultValue = {
    component: null,
    props: {
      current: false,
      checked: false,
    }
  };

  node.deepCloneValueFunc = (val: TreeNodeValue): TreeNodeValue => {
    return {
      component: val.component,
      props: deepClone(val.props)
    };
  };

  node.onValueChange = (val: TreeNodeValue): void => {
    val.component?.value$.next(val);
  };

  node.onChildrenChange = (val: TreeNodeValue, children: TreeNode<TreeNodeValue>[]): void => {
    val.component?.children$.next(children);
  };
}

export function createTreeNodeComponent(
    parent: TreeNode<TreeNodeValue> | null,
    children: TreeNode<TreeNodeValue>[],
    path: number[],
    value?: TreeNodeValue
  ): TreeNode<TreeNodeValue> {
  return new TreeNode<TreeNodeValue>(parent, value, children, path, patchNode);
}

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  root!: TreeNode<TreeNodeValue>;
  history: TreeNode<TreeNodeValue>[] = [];
  depth = new BehaviorSubject<number>(0);
  currentNode = new BehaviorSubject<TreeNode<TreeNodeValue> | null>(null);
  record = false;

  constructor() {
    this.root = createTreeNodeComponent(null, [], [0]);

    this.root.generateNodes(5, 2);
    this.depth.next(this.root.getDepth());
    // interval(100).subscribe(() => {
    //   const randomNode = this.root.getRandomNode();
    //   if (randomNode) {
    //     this.changeCurrentNode(randomNode);
    //   }
    // });
  }

  onCheck(node: TreeNode<TreeNodeValue>): void {
    if (this.record) {
      this.history.push(node);
    }
  }

  startRecording(): void {
    this.record = true;
  }

  stopRecording(): void {
    this.record = false;
    // let counter = 0;
    // setInterval(() => {
    //   if (counter < this.history.length) {
    //     this.history[counter].value.component?.shakeAnimation();
    //     counter++;
    //   } else {
    //     return;
    //   }
    // }, 200);
  }

  reset(): void {
    this.history.forEach(n => this.changeProps(n, { checked: false }));
    this.history = [];
  }

  changeProps(node: TreeNode<TreeNodeValue>, props: Partial<TreeNodeValueProps>): void {
    node.changeValue({ props: { ...node.value.props, ...props }});
  }

  showChecked(): void {
    this.history.forEach(n => this.changeProps(n, { checked: true }));
  }

  addNode(node: TreeNode<TreeNodeValue>): void {
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

  getNextAvailableNodeAfterDeletion(removedNode: TreeNode<TreeNodeValue>): TreeNode<TreeNodeValue> {
    if (removedNode.parent) {
      if (removedNode.parent.children.length > 0) {
        return removedNode.parent.children[removedNode.parent.children.length - 1];
      }
      return removedNode.parent;
    } else {
      throw new Error('removed node does not have a parent');
    }
  }

  changeCurrentNode(node: TreeNode<TreeNodeValue>): void {
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
