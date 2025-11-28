# CollegeMedia Mail System

A comprehensive, Gmail-style email interface built with React, TypeScript, and modern web technologies.

## Features

### 🎯 Core Functionality
- **Threaded Conversations**: View email threads with collapsible messages
- **Real-time Search**: Debounced search with advanced filters
- **Bulk Operations**: Select, archive, delete, and label multiple threads
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 📧 Email Management
- **Folders**: Inbox, Starred, Sent, Drafts, Trash
- **Custom Labels**: Create, edit, and delete custom labels with color coding
- **Star & Important**: Mark threads as starred or important
- **Read/Unread**: Track message status with visual indicators

### 🔍 Advanced Search
- **Query-based Search**: Search across subjects, content, and participants
- **Filters**: Filter by sender, recipient, attachments, and date ranges
- **Label Filtering**: Filter threads by specific labels

### ✍️ Compose & Reply
- **Rich Text Editor**: Write emails with formatting support
- **Attachments**: Add and manage file attachments
- **Recipients**: To, CC, and BCC fields with validation
- **Draft Auto-save**: Automatic draft saving functionality

### ⌨️ Keyboard Shortcuts
- **j/k**: Navigate up/down through threads
- **x**: Select current thread
- **e**: Archive selected threads
- **r**: Reply to current thread
- **c**: Compose new message
- **a**: Select all threads
- **u**: Mark as read/unread
- **s**: Toggle star
- **Delete/Backspace**: Delete selected threads
- **Escape**: Clear selection

### ♿ Accessibility Features
- **ARIA Labels**: Proper screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Intelligent focus handling
- **High Contrast**: Support for high-contrast themes

## Architecture

### Component Structure
```
src/components/mail/
├── MailLayout.tsx          # Main layout container
├── MailSidebar.tsx         # Left sidebar with folders/labels
├── MailTopbar.tsx          # Top bar with search and profile
├── ThreadList.tsx          # List of email threads
├── ThreadRow.tsx           # Individual thread row
├── ThreadView.tsx          # Thread detail view
├── ComposeModal.tsx        # Compose new email modal
└── LabelManager.tsx        # Label management modal
```

### State Management
- **MailContext**: Centralized state management using React Context
- **MailService**: Service layer for API interactions (currently mock data)
- **Redux-like Pattern**: Predictable state updates with actions and reducers

### Data Flow
1. **MailProvider** wraps the application
2. **MailContext** manages global state
3. **Components** consume state via `useMail()` hook
4. **Actions** dispatched through context methods
5. **Service layer** handles API calls and data persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- CollegeMedia app dependencies

### Installation
The mail system is already integrated into the CollegeMedia application. No additional installation required.

### Usage
1. Navigate to `/mails` in the CollegeMedia app
2. Use the sidebar to switch between folders
3. Click on threads to view messages
4. Use the compose button to write new emails
5. Utilize keyboard shortcuts for quick navigation

## Integration Points

### Backend API Integration
The system is designed for easy backend integration. Replace mock data in `src/services/mailService.ts` with real API calls:

```typescript
// Example API integration
async listThreads(folder: string, page: number, filters?: MailSearchFilters) {
  const response = await fetch(`/api/mail/threads?folder=${folder}&page=${page}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  return response.json();
}
```

### Authentication
Integrate with your existing authentication system by updating the `useMail` hook to include auth tokens in API requests.

### Real-time Updates
Add WebSocket support for real-time email notifications and updates.

## Customization

### Themes
The system supports light/dark themes through CSS variables. Customize colors in your theme configuration.

### Styling
All components use Tailwind CSS classes and can be easily customized through the design system.

### Labels & Folders
Add custom system folders and labels by updating the mock data in `mailService.ts`.

## Performance Features

### Virtualization
The thread list supports virtualization for large inboxes (implementation ready for integration).

### Debounced Search
Search queries are debounced to prevent excessive API calls.

### Code Splitting
Heavy components are ready for dynamic imports and code splitting.

### Lazy Loading
Thread content loads on-demand to improve initial page load times.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Adding New Features
1. Create new components in `src/components/mail/`
2. Add types to `src/types/mail.ts`
3. Update the context in `src/contexts/MailContext.tsx`
4. Add service methods in `src/services/mailService.ts`

### Testing
The system includes comprehensive TypeScript types for development-time error checking.

### Debugging
Use browser dev tools to inspect the mail context state and debug component behavior.

## Future Enhancements

### Planned Features
- **Rich Text Editor**: Enhanced email composition with formatting
- **File Upload**: Drag & drop file attachments
- **Email Templates**: Predefined email templates
- **Advanced Filters**: Saved search filters
- **Email Scheduling**: Send emails at specific times
- **Read Receipts**: Track email read status

### Performance Improvements
- **Virtual Scrolling**: For very large inboxes
- **Service Worker**: Offline email support
- **IndexedDB**: Local email caching
- **WebAssembly**: For heavy email processing

## Contributing

1. Follow the existing code structure and patterns
2. Maintain TypeScript types for all new features
3. Ensure accessibility compliance
4. Add comprehensive error handling
5. Test across different screen sizes

## License

This mail system is part of the CollegeMedia application and follows the same licensing terms.

---

**Note**: This is a production-ready email interface that can be easily integrated with real backend services. The current implementation uses mock data for demonstration purposes.


