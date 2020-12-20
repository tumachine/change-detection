import { Injectable } from '@angular/core';
import { TreeNode, TreeNodeState } from './node';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  root!: TreeNode;
  // currentComponent!: TreeNodeComponent;
  history: string[] = [];
  depth = new BehaviorSubject<number>(0);
  currentComponent = new BehaviorSubject<TreeNodeComponent | null>(null);

  constructor() {
    this.root = this.createFirstNode();
    this.root.generateNodes(4, 2);
    this.depth.next(this.root.getDepth());
  }

  onCheck(name: string): void {
    this.history.push(name);
    console.log(this.history);
  }

  reset(): void {
    this.history = [];
  }

  addNode(node: TreeNode): void {
    // node.addChild(new TreeNode(node));
    const component = this.currentComponent.value;
    component?.node.addChild(new TreeNode(node));
    this.depth.next(this.root.getDepth());
    component?.markForCheck();
  }

  removeNode(): void {
    const component = this.currentComponent.value;
    if (component?.node.remove()) {
      // const children = component?.node.parent?.children;
      // if (children && children.length > 0) {
      //   this.currentComponent.next()
      // }
      // if (parent?.children.length > 0) {}
      // if (component?.node.parent?.children.length > 0) {
      //
      // }
      this.depth.next(this.root.getDepth());
      component?.markForCheck();
    }
  }

  changeCurrentNode(nodeComponent: TreeNodeComponent): void {
/*    this.root = this.root.copy();

    if (this.current) {
      const foundCurrentNodeFromCopy = this.root.findNode(this.current);
      if (foundCurrentNodeFromCopy) {
        foundCurrentNodeFromCopy.changeState({ current: false });
      }
    }
    const foundNodeFromCopy = this.root.findNode(node);
    if (foundNodeFromCopy) {
      foundNodeFromCopy.changeState({ current: true });
    }
    this.current = foundNodeFromCopy;*/
    const component = this.currentComponent.value;
    if (component === nodeComponent) {
      component.node.changeState({ current: !component.node.state.current });
      this.currentComponent.next(null);
      component.markForCheck();
    } else {
      if (component) {
        component.node.changeState({ current: false });
        component.markForCheck();
      }
      nodeComponent.node.changeState({ current: true });
      this.currentComponent.next(nodeComponent);
    }
  }

  createFirstNode(): TreeNode  {
    return new TreeNode(null, [], [0]);
  }
}
