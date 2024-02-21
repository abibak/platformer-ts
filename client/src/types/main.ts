type Callback = (arg?: any) => void;

type Subscriber = Record<string, {[key: string | number]: Callback}>