import { Node } from '@tiptap/core'

export const Video = Node.create({
    name: 'video', group: 'block', selectable: true, atom: true,
    addAttributes() {
        return { src: { default: null }, muted: { default: true }, }
    },
    parseHTML() {
        return [{ tag: 'video' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['video', { ...HTMLAttributes, controls: true, muted: true }, ['source', { src: HTMLAttributes.src, type: 'video/mp4' }]]
    },
    addCommands() {
        return {
            setVideo: (options) => ({ commands }) => {
                return commands.insertContent({ type: this.name, attrs: { src: options.src, muted: true } })
            },
        }
    },
})
