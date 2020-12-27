import { deepClone, randomInt } from './utils';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';
import { BehaviorSubject } from 'rxjs';

export interface TreeNodeValueProps {
  current: boolean;
  checked: boolean;
}

export const defaultTreeNodeValueProps: TreeNodeValueProps = {
  current: false,
  checked: false,
};

export const defaultTreeNodeValue: TreeNodeValue = {
  component: null,
  props: defaultTreeNodeValueProps,
};

function deepCloneFunc(value: TreeNodeValue): TreeNodeValue {
  return {
    component: value.component,
    props: deepClone(value.props)
  };
}

export interface TreeNodeValue {
  component: TreeNodeComponent | null;
  props: TreeNodeValueProps;
}

export class TreeNode {
  parent: TreeNode | null = null;
  children = new BehaviorSubject<TreeNode[]>([]);
  path: number[] = [];
  value = new BehaviorSubject<TreeNodeValue>(deepCloneFunc(defaultTreeNodeValue));

  constructor(
    parent: TreeNode | null = null,
    value: TreeNodeValue = defaultTreeNodeValue,
    children: TreeNode[] = [],
    path: number[] = []
  ) {
    this.parent = parent;
    this.children.next(children);
    this.path = path;
    this.value.next(deepCloneFunc(value));
  }

  getDepth(): number {
    const depthsGatherer: number[] = [];
    this.getNodeDepths(this, depthsGatherer);
    return Math.max(...depthsGatherer);
  }

  addChild(child: TreeNode, index: number | null = null): void {
    child.parent = this;
    if (index) {
      this.children.next(this.children.value.filter((c, i) => i !== index));
      child.path = this.createNodePath(index);
      this.nameChildren(this, index);
    } else {
      this.children.next([ ...this.children.value, child ]);
      child.path = this.createNodePath(this.children.value.length - 1);
    }
  }

  getProps(): TreeNodeValueProps {
    return this.value.value.props;
  }

  changeProps(partialProps: Partial<TreeNodeValueProps>): void {
    const { props, component } = this.value.value;
    this.value.next({ component, props: { ...props, ...partialProps }});
  }

  generateNodes(depth: number, childrenNum: number, child: TreeNode = this): void {
    if (depth <= 1) {
      return;
    }
    for (let i = 0; i < childrenNum; i++) {
      const newChild = new TreeNode(null, deepCloneFunc(defaultTreeNodeValue));
      child.addChild(newChild);
    }

    child.children.value.forEach(n => this.generateNodes(depth - 1, childrenNum, n));
  }

  removeChild(child: TreeNode): void {
    const childIndex = child.path[child.path.length - 1];
    this.children.next(this.children.value.filter((c, i) => i !== childIndex));
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
    let randomNode = new TreeNode(null, defaultTreeNodeValue, [], []);
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
    return new TreeNode(node, deepCloneFunc(node.value.value), [], [ ...node.path ]);
  }

  private copyNodeRecursive(real: TreeNode, copy: TreeNode): TreeNode {
    // real.children.forEach(n => copy.children.push(this.copyNodeRecursive(n, this.copyNode(n))));
    real.children.value.forEach(n => copy.children.next([ ...copy.children.value, this.copyNodeRecursive(n, this.copyNode(n)) ]));
    return copy;
  }

  private getNodeDepths(node: TreeNode, depthsGatherer: number[], depthCounter = 1): void {
    if (node.children.value.length === 0) {
      depthsGatherer.push(depthCounter);
      return;
    }
    node.children.value.forEach(child => this.getNodeDepths(child, depthsGatherer, depthCounter + 1));
  }

  // private nameChildren(children: TreeNode[] = this.children, from = 0): void {
  //   children.forEach((child, i) => {
  //     child.path = this.createNodePath(i);
  //     this.nameChildren(child.children, 0);
  //   });
  // }

  private nameChildren(node: TreeNode = this, from = 0): void {
    node.children.value.forEach((child, i) => {
      child.path = this.createNodePath(i);
      this.nameChildren(child, 0);
    });
  }

  // on operation true, stop walking
  private walkOverChildren(needToStopFn: (n: TreeNode) => boolean, nodes: TreeNode[] = this.children.value): void {
    nodes.forEach(n => {
      if (needToStopFn(n)) {
        return;
      }
      this.walkOverChildren(needToStopFn, n.children.value);
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
    // @ts-ignore
    node.children.forEach((child, i) => {
      if (!this.checkNode(node, i) || !this.checkNodeChildren(child)) {
        return false;
      }
    });
    return true;
  }

  private checkNode(parent: TreeNode, childIndex: number): boolean {
    const correctPath = this.createNodePath(childIndex, parent);
    const samePaths = this.comparePaths(parent.path, correctPath);

    if (!samePaths) {
      console.error(`INCORRECT PATH: ${parent.path[childIndex]}, SHOULD BE: ${correctPath}`);
    }
    return samePaths;
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
      children = children.value[node.path[i]].children;
    }
    return children.value[node.path[node.path.length - 1]];
  }
}
