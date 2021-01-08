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

  getProps(): TreeNodeValueProps {
    return this.value.props;
  }

  changeProps(props: Partial<TreeNodeValueProps>): void {
    this.changeValue({ props: { ...this.getProps(), ...props }});
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
  isRecording = false;
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

  toggleRecording(): void {
    this.enableRecording.next(!this.enableRecording.value);
  }

  reset(): void {
    this.history.forEach(n => n.changeProps({ checked: false }));
    this.history = [];
  }

  showChecked(): void {
    this.prevHistory.forEach(n => n.changeProps({ checked: false }));

    if (this.history[0]?.value) {
      this.intervalUtils.overArray(this.history, (historyItem) => {
        historyItem.value.component?.animationShake?.player?.play();
        historyItem.changeProps({ checked: true });
      }, 100);
    }
  }

  record(onDone: () => void = () => {}): void {
    this.startRecording();
    setTimeout(() => {
      this.stopRecording();
      onDone();
    }, 50);
  }

  toggleDetectionMethod(changeChildren: boolean): void {
    if (this.currentNode.value) {
      const toggleOnPush = !this.currentNode.value?.getProps().onPush;
      // this.currentNode.value.changeProps({ onPush: toggleOnPush });
      const descendants = this.currentNode.value.getDescendants().reverse();
      descendants.push(this.currentNode.value);
      this.intervalUtils.overArray(
        descendants,
        (desc, i) => {
          const customAnimation = toggleOnPush ? desc.value.component?.animationChangeOnPush : desc.value.component?.animationChangeDefault;

          customAnimation?.player.play();
          customAnimation?.player.onDone(() => {
            if (desc?.parent) {
              desc.changeProps({ onPush: toggleOnPush });
            }
          });
        }, 100);
    }
  }

  private startRecording(): void {
    this.intervalUtils.stop();
    this.prevHistory = [ ...this.history];
    this.history = [];
    this.isRecording = true;
  }

  private stopRecording(): void {
    this.isRecording = false;
  }

  onCheck(node: TreeNodeAsComponent): void {
    if (this.isRecording && this.enableRecording.value) {
      this.history.push(node);
    }
  }

  addNode(node: TreeNodeAsComponent): void {
    this.currentNode.value?.addChild(node);
    this.depth.next(this.root.getDepth());
  }

  removeNode(): void {
    const node = this.currentNode.value;
    if (node && node?.parent) {
      const descendants = node.getDescendants().reverse();
      descendants.push(node);
      this.intervalUtils.overArray(
        descendants,
        (desc, i) => {

          desc.value.component?.animationDeleteShrink.player.play();
          if (i === descendants.length - 1) {
              desc.value.component?.animationDeleteShrink.player.onDone(() => {
                if (desc?.parent) {
                  desc.parent.removeChild(desc);
                  this.changeCurrentNode(this.getNextAvailableNodeAfterDeletion(desc));
                  this.depth.next(this.root.getDepth());
                }
            });
          }
        }, 100);
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
      currentNode.changeProps({ current : !currentNode.getProps().current });
      this.currentNode.next(null);
    } else {
      if (currentNode) {
        currentNode.changeProps({ current : !currentNode.getProps().current });
      }
      node.changeProps({ current : !node.getProps().current });
      this.currentNode.next(node);
    }
  }
}
