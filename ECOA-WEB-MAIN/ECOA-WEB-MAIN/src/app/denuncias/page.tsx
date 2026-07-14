'use client';

import React, { useRef, useState, useEffect, memo } from 'react';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import ComplaintsService from '@/services/complaints.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Calendar, User } from 'lucide-react';
import { Grid, CellComponentProps } from 'react-window';
import { Skeleton } from '@/components/ui/skeleton';

type ComplaintItem = {
  id: string;
  title?: string;
  type?: string;
  description: string;
  status?: string;
  user?: { realName?: string };
  createdAt: string;
};

interface ComplaintCellData {
  items: ComplaintItem[];
  columnCount: number;
}

const ComplaintCell = ({ 
  columnIndex, 
  rowIndex, 
  style, 
  items, 
  columnCount 
}: CellComponentProps<ComplaintCellData>): React.ReactElement | null => {
  const index = rowIndex * columnCount + columnIndex;
  const item = items?.[index];

  if (!item) return null;

  return (
    <div style={style} className="p-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="glass border-white/10 bg-white/5 dark:bg-white/10 dark:border-white/20 backdrop-blur-md hover:border-primary/30 transition-all cursor-pointer group h-full select-none">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className="uppercase text-[10px] bg-primary/10 text-primary border-primary/20">
                {item.status || 'Pendente'}
              </Badge>
              <ShieldAlert className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold uppercase mb-2 line-clamp-1 break-words">{item.title || item.type}</h3>
            <p className="text-muted-foreground text-sm italic mb-6 line-clamp-2 grow break-words">{item.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] uppercase font-bold text-muted-foreground mt-auto">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>{item.user?.realName || 'Anônimo'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default function ComplaintsPage() {
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints-list'],
    queryFn: () => ComplaintsService.getComplaints()
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const columnCount = containerWidth < 640 ? 1 : containerWidth < 1024 ? 2 : 3;
  const itemsList = complaints?.items || [];
  const rowCount = Math.ceil(itemsList.length / columnCount);
  const itemWidth = (containerWidth - 48) / columnCount;
  const itemHeight = 250;

  return (
    <main className="flex flex-col min-h-screen pt-20">
      <Header />
      <div className="container mx-auto px-6 py-12 grow">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 text-glow"
          >
            Queixas <span className="text-primary">Globais</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground uppercase tracking-widest text-xs font-bold"
          >
            Monitoramento de incidentes em tempo real
          </motion.p>
        </header>

        {(!hasMounted || isLoading) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div 
                key={i} 
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ repeat: Infinity, duration: 2, ease: [0.4, 0, 0.2, 1], delay: i * 0.15 }}
                className="glass bg-white/5 dark:bg-white/10 border-white/10 dark:border-white/20 backdrop-blur-md p-6 space-y-4 rounded-xl"
              >
                 <div className="flex justify-between">
                    <Skeleton className="w-20 h-5" />
                    <Skeleton className="w-5 h-5" />
                 </div>
                 <Skeleton className="w-full h-6" />
                 <Skeleton className="w-full h-12 opacity-50" />
                 <div className="flex justify-between pt-4">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-24 h-3" />
                 </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div ref={containerRef} className="w-full mb-20 overflow-hidden">
            <Grid<ComplaintCellData>
              columnCount={columnCount}
              columnWidth={itemWidth}
              rowCount={rowCount}
              rowHeight={itemHeight}
              cellComponent={ComplaintCell}
              cellProps={{
                items: itemsList,
                columnCount: columnCount
              }}
              style={{ overflowX: 'hidden' }}
            />
          </div>
        )}
      </div>
    </main>
  );
}



