# Pokemon Research Lab 🚀

A high-performance web application for aggregating, analyzing, and manipulating comprehensive Pokemon datasets. Built with modern web technologies to handle large amounts of data efficiently on the client side.

## ✨ Features

### 🗄️ Dual Data Sources
- **API Aggregation Engine**: Fetch complete Pokédex dataset from PokeAPI with progress tracking
- **CSV Upload & Processing**: Upload large CSV files (10MB-100MB) with client-side streaming
- **Schema Mapping**: Intuitive interface to map CSV columns to Pokemon data structure

### 📊 High-Performance Data Table
- **Virtualization**: TanStack Table + TanStack Virtual for smooth performance with 1000+ rows
- **Interactive Editing**: Edit data directly in table cells with real-time updates
- **Sorting & Filtering**: Sort by any column for data analysis
- **Sticky Columns**: First and last columns remain visible during horizontal scrolling

### 🔧 Dynamic Column Creation
- **Runtime Columns**: Add new custom columns at runtime
- **Data Type Support**: Text, Number, and Boolean column types
- **Automatic Population**: New columns automatically populated with default values

### 🤖 AI Editing Assistant (Bonus Feature)
- **Natural Language Commands**: Edit data using conversational commands
- **Pattern Recognition**: Understands various command formats
- **Examples**:
  - `"set hp to 100 for all pokemon of type 'grass'"`
  - `"delete rows where generation is 1"`
  - `"update ability to 'levitate' where name is 'gengar'"`

### 📤 Data Export
- **CSV Export**: Download modified data as CSV files
- **Bulk Operations**: Select and delete multiple rows
- **Data Persistence**: Local storage with Zustand persistence

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Tables**: TanStack Table + TanStack Virtual
- **CSV Processing**: PapaParse
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokemon-research-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### 1. Fetching Pokemon Data
- Click "Fetch Full Pokédex Dataset" to retrieve all Pokemon from PokeAPI
- Monitor progress with real-time progress bar
- Data is automatically stored in local storage

### 2. Uploading CSV Files
- Click "Choose File" in the CSV Upload section
- Map your CSV columns to Pokemon data fields
- Set appropriate data types for each column
- Click "Import Data" to load your data

### 3. Working with the Table
- **Sort**: Click column headers to sort data
- **Edit**: Click on editable cells to modify values
- **Select**: Use checkboxes to select multiple rows
- **Delete**: Remove selected rows with the delete button

### 4. Adding Custom Columns
- Click "Add Column" button in the rightmost column
- Enter column name and select data type
- New column appears immediately with default values

### 5. Using AI Assistant
- Click "AI Assistant" button in the header
- Type natural language commands
- View results and affected Pokemon count

### 6. Exporting Data
- Click "Export CSV" button to download current data
- File includes all columns except the "Add Column" button

## 🎯 Performance Features

- **Client-side Processing**: Large CSV files processed without server upload
- **Virtual Scrolling**: Only visible rows rendered for smooth performance
- **Efficient State Management**: Zustand with selective updates
- **Lazy Loading**: Components and utilities loaded on demand
- **Memory Optimization**: Streaming CSV parsing prevents memory issues

## 🔧 Configuration

### Environment Variables
No environment variables required - the app works entirely on the client side.

### Customization
- Modify `src/lib/store.ts` to change default columns
- Update `src/types/pokemon.ts` for Pokemon data structure
- Customize AI commands in `src/lib/ai-commands.ts`

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PokeAPI](https://pokeapi.co/) for providing Pokemon data
- [TanStack](https://tanstack.com/) for excellent table and query libraries
- [Zustand](https://github.com/pmndrs/zustand) for lightweight state management
- [Next.js](https://nextjs.org/) for the amazing React framework

## 📞 Support

If you encounter any issues or have questions:
- Create an issue in the repository
- Check the browser console for error messages
- Ensure all dependencies are properly installed

---

**Happy Pokemon Research! 🎉**

