declare module "html2canvas" {
  interface Html2CanvasOptions {
    scale?: number;
    backgroundColor?: string | null;
    useCORS?: boolean;
    allowTaint?: boolean;
    logging?: boolean;
  }

  export default function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
}
