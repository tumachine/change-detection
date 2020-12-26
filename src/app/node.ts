import { deepClone, randomInt } from './utils';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';

export interface TreeNodeValueProps {
  current: boolean;
}

export const defaultTreeNodeValue: TreeNodeValue = {
  component: null,
  props: {
    current: false,
  }
};

function deepCloneFunc(value: TreeNodeValue): TreeNodeValue {
  return {
    component: null,
    props: deepClone(value.props)
  };
}

export function getDefaultTreeNodeValue(): TreeNodeValue {
  return deepCloneFunc(defaultTreeNodeValue);
}


export interface TreeNodeValue {
  component: TreeNodeComponent | null;
  props: TreeNodeValueProps;
}

export class TreeNode {
  parent!: TreeNode | null;
  children!: TreeNode[];
  path!: number[];
  value!: TreeNodeValue;

  constructor(parent: TreeNode | null = null, value: TreeNodeValue = getDefaultTreeNodeValue(), children: TreeNode[] = [], path: number[] = []) {
    this.parent = parent;
    this.children = children;
    this.path = path;
    this.value = value;
  }

  getDepth(): number {
    const depths: number[] = [];
    this.getNodeDepths(this.children, depths);
    return Math.max(...depths);
  }

  addChild(child: TreeNode, index: number | null = null): void {
    child.parent = this;
    if (index) {
      this.children.splice(index, 0, child);
      child.path = this.createNodePath(index);
      this.nameChildren(this.children, index);
    } else {
      this.children.push(child);
      child.path = this.createNodePath(this.children.length - 1);
    }
  }

  remove(): boolean {
    if (this.parent) {
      this.parent.removeChild(this);
      return true;
    }
    return false;
  }

  generateNodes(depth: number, childrenNum: number, child: TreeNode = this): void {
    if (depth <= 1) {
      return;
    }
    for (let i = 0; i < childrenNum; i++) {
      const newChild = new TreeNode(null, deepCloneFunc(defaultTreeNodeValue));
      child.addChild(newChild);
    }

    child.children.forEach(n => this.generateNodes(depth - 1, childrenNum, n));
  }

  removeChild(child: TreeNode): void {
    const childIndex = child.path[child.path.length - 1];
    this.children.splice(childIndex, 1);
    this.nameChildren();
  }

  copy(): TreeNode {
    return this.copyNodeRecursive(this, this.copyNode(this));
  }

  countNodes(): number {
    let amount = 1;
    this.walkOverChildren(() => {
      amount += 1;
      return false;
    });
    return amount;
  }

  getRandomNode(): TreeNode {
    const randomNodeNum = randomInt(0, this.countNodes());
    if (randomNodeNum === 0) {
      return this;
    }

    let counter = 0;
    let randomNode = new TreeNode(null, getDefaultTreeNodeValue(), [], []);
    this.walkOverChildren(n => {
      counter++;
      if (counter === randomNodeNum) {
        randomNode = n;
        return true;
      }
      return false;
    });
    return randomNode;
  }

  private copyNode(node: TreeNode): TreeNode {
    return new TreeNode(node, deepCloneFunc(node.value), [], [ ...node.path ]);
  }

  private copyNodeRecursive(real: TreeNode, copy: TreeNode): TreeNode {
    real.children.forEach(n => copy.children.push(this.copyNodeRecursive(n, this.copyNode(n))));
    return copy;
  }

  private getNodeDepths(children: TreeNode[], depths: number[], d = 1): void {
    if (children.length === 0) {
      depths.push(d);
      return;
    }
    children.forEach(child => this.getNodeDepths(child.children, depths, d + 1));
  }

  private nameChildren(children: TreeNode[] = this.children, from = 0): void {
    for (let i = from; i < children.length; i++) {
      children[i].path = this.createNodePath(i);
      this.nameChildren(children[i].children, 0);
    }
  }

  // on operation true, stop walking
  private walkOverChildren(operation: (n: TreeNode) => boolean, nodes: TreeNode[] = this.children): void {
    nodes.forEach(n => {
      if (operation(n)) {
        return;
      }
      this.walkOverChildren(operation, n.children);
    });
  }

  private createNodePath(index: number, node: TreeNode = this): number[] {
    return node.path.concat(index);
  }

  private comparePaths(pathOne: number[], pathTwo: number[]): boolean {
    if (pathOne.length !== pathTwo.length) {
      return false;
    }

    for (let i = 0; i < pathOne.length; i++) {
      if (pathOne[i] !== pathTwo[i]) {
        return false;
      }
    }
    return true;
  }

  private checkNodeChildren(node: TreeNode): boolean {
    for (let i = 0; i < node.children.length; i++) {
      if (!this.checkNode(node, i) || !this.checkNodeChildren(node.children[i])) {
        return false;
      }
    }
    return true;
  }

  private checkNode(parent: TreeNode, childIndex: number): boolean {
    const correctPath = this.createNodePath(childIndex, parent);
    const correct = this.comparePaths(parent.path, correctPath);

    if (!correct) {
      console.error(`INCORRECT PATH: ${parent.path[childIndex]}, SHOULD BE: ${correctPath}`);
    }
    return correct;
  }

  findNode(node: TreeNode): TreeNode | null {
    if (this.path.length === node.path.length) {
      return this;
    }

    if (this.path.length > node.path.length) {
      return null;
    }

    let children = this.children;
    for (let i = this.path.length; i < node.path.length - 1; i++) {
      children = children[node.path[i]].children;
    }
    return children[node.path[node.path.length - 1]];
  }
}
