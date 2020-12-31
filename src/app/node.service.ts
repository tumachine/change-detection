import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { TreeNode, TreeNodeConfig } from './node';
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

class TreeNodeConfigForComponent implements TreeNodeConfig<TreeNodeValue> {
  value = new BehaviorSubject<TreeNodeValue | null>(null);
  children = new BehaviorSubject<TreeNode<TreeNodeValue>[]>([]);

  defaultValue: TreeNodeValue = {
    component: null,
    props: {
      current: false,
      checked: false,
    }
  };

  deepCloneValueFunc(val: TreeNodeValue): TreeNodeValue {
    return {
      component: val.component,
      props: deepClone(val.props)
    };
  }

  onValueChange(val: TreeNodeValue): void {
    this.value.next(val);
    console.log('prop change');
    return;
  }

  onChildrenChange(val: TreeNodeValue, children: TreeNode<TreeNodeValue>[]): void {
    this.children.next(children);
    console.log('prop change');
    return;
  }
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
    this.root = new TreeNode();
    this.root.path = [0];

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
    console.log(this.history);
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
    const currentNode = this.currentNode.value;
    currentNode?.addChild(node);
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
