import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RESEARCH_STUDIES } from '../data/researchData';

export const ResearchLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedStudyId, setExpandedStudyId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Studies' },
    { id: 'glp1_reta', label: 'GLP-1 & Retatrutide Trials' },
    { id: 'protein', label: 'Protein & Muscle Retention' },
    { id: 'hypertrophy', label: 'Hypertrophy & Training' },
  ];

  const filteredStudies = useMemo(() => {
    return RESEARCH_STUDIES.filter(study => {
      const matchesCat = selectedCategory === 'all' || study.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.actionableProtocol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedStudyId(prev => (prev === id ? null : id));
  };

  return (
    <div className="shell" style={{ paddingBlock: '32px 72px' }}>
      {/* Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--muted)', margin: '0 0 6px 0' }}>
            CLINICAL EVIDENCE & PEER-REVIEWED LITERATURE
          </p>
          <h2 style={{ font: 'clamp(28px, 4vw, 36px) var(--serif)', margin: 0, color: 'var(--ink)' }}>
            Empirical Research Library
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', maxWidth: '380px' }}>
          Peer-reviewed human clinical trials translated into actionable protocols.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '28px',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '16px',
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--green)' : 'transparent',
                  background: isSelected ? 'var(--green)' : '#f4f5ee',
                  color: isSelected ? '#ffffff' : 'var(--ink)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        <div style={{ minWidth: '220px', flex: '1 1 200px', maxWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search trials, reta, protein..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--line)',
              fontSize: '12px',
              background: '#fafaf6',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Studies Grid with motion animations */}
      <AnimatePresence mode="popLayout">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredStudies.map(study => {
            const isExpanded = expandedStudyId === study.id;
            return (
              <motion.article
                key={study.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(32, 59, 50, 0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.8px',
                        color: study.category === 'glp1_reta' ? 'var(--orange)' : 'var(--green)',
                        textTransform: 'uppercase',
                        background: study.category === 'glp1_reta' ? '#faede8' : '#eef4ea',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {study.journal} · {study.year}
                    </span>
                    {study.doiOrUrl && (
                      <a
                        href={study.doiOrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', textDecoration: 'none', color: 'var(--green)', fontWeight: 600 }}
                      >
                        PubMed ↗
                      </a>
                    )}
                  </div>

                  <h3 style={{ font: '17px/1.3 var(--serif)', margin: '0 0 6px 0', color: 'var(--ink)' }}>
                    {study.title}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '0 0 14px 0' }}>
                    {study.authors}
                  </p>

                  <div style={{ background: '#f5f7ee', padding: '12px 14px', borderRadius: '10px', marginBottom: '12px', borderLeft: '3px solid var(--green)' }}>
                    <strong style={{ fontSize: '11px', color: 'var(--green)', display: 'block', marginBottom: '2px' }}>
                      Key Scientific Takeaway:
                    </strong>
                    <p style={{ fontSize: '12px', color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
                      {study.keyTakeaway}
                    </p>
                  </div>

                  {/* Expandable context to keep layout neat */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 12px 0' }}
                    >
                      <strong>Trial Design:</strong> {study.clinicalContext}
                    </motion.div>
                  )}
                </div>

                <div>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '11px', color: 'var(--orange)', display: 'block' }}>
                        Actionable Protocol:
                      </strong>
                      <button
                        type="button"
                        onClick={() => toggleExpand(study.id)}
                        style={{
                          background: 'none',
                          border: 0,
                          fontSize: '11px',
                          color: 'var(--green)',
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        {isExpanded ? 'Less detail ↑' : 'Study details ↓'}
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--ink)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      {study.actionableProtocol}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
};
