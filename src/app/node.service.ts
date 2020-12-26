import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { defaultTreeNodeValue, TreeNode } from './node';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  root!: TreeNode;
  history: string[] = [];
  depth = new BehaviorSubject<number>(0);
  currentNode = new BehaviorSubject<TreeNode | null>(null);

  constructor() {
    this.root = this.createFirstNode();
    this.root.generateNodes(3, 3);
    this.depth.next(this.root.getDepth());
    console.log(this.root.countNodes());
    // interval(100).subscribe(() => {
    //   const randomNode = this.root.getRandomNode();
    //   if (randomNode) {
    //     this.changeCurrentNode(randomNode);
    //   }
    // });
  }

  onCheck(name: string): void {
    this.history.push(name);
    console.log(this.history);
  }

  reset(): void {
    this.history = [];
  }

  addNode(node: TreeNode): void {
    const currentNode = this.currentNode.value;
    currentNode?.addChild(node);
    this.depth.next(this.root.getDepth());
    currentNode?.value.component?.markForCheck();
  }

  removeNode(): void {
    const node = this.currentNode.value;
    if (node && node?.parent) {
      node.remove();
      if (node.parent.children.length > 0) {
        const leftChild = node.parent.children[node.parent.children.length - 1];
        this.changeCurrentNode(leftChild);
        // leftChild?.value.markForCheck();
      } else if (node.parent) {
        this.changeCurrentNode(node.parent);
      }
      this.depth.next(this.root.getDepth());
      node?.value.component?.markForCheck();
    }
  }

  changeCurrentNode(node: TreeNode): void {
    const currentNode = this.currentNode.value;
    if (currentNode === node) {
      currentNode.value.props.current = !currentNode.value.props.current;
      this.currentNode.next(null);
      currentNode?.value.component?.markForCheck();
    } else {
      if (currentNode) {
        currentNode.value.props.current = false;
        currentNode?.value.component?.markForCheck();
      }
      node.value.props.current = true;
      node?.value.component?.markForCheck();
      this.currentNode.next(node);
    }
  }

  createFirstNode(): TreeNode  {
    return new TreeNode(null, defaultTreeNodeValue, [] , [0]);
  }
}
